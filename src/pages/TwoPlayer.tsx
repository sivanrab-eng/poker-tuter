import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import PlayingCard from '@/components/poker/PlayingCard';
import { ArrowRight, Copy, Share2 } from 'lucide-react';
import type { Card } from '@/lib/pokerEngine';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const;

function genRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function makeDeck(): string[] {
  const d: string[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push(r + s);
  // Fisher-Yates shuffle
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function parseCardStr(str: string): Card {
  const suit = str.slice(-1) as Card['suit'];
  const rank = str.slice(0, -1) as Card['rank'];
  return { rank, suit };
}

function rankValue(r: string): number {
  const map: Record<string, number> = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14};
  return map[r] ?? 0;
}

function evaluateHand(cards: string[]): { score: number; nameKey: string } {
  const suits = cards.map(c => c.slice(-1));
  const ranks = cards.map(c => c.slice(0, -1));
  const rc: Record<string, number> = {};
  ranks.forEach(r => rc[r] = (rc[r] || 0) + 1);
  const counts = Object.values(rc).sort((a, b) => b - a);
  const sc: Record<string, number> = {};
  suits.forEach(s => sc[s] = (sc[s] || 0) + 1);
  const isFlush = Object.values(sc).some(c => c >= 5);
  const sr = [...new Set(ranks.map(rankValue))].sort((a, b) => a - b);
  let isStraight = false;
  for (let i = 0; i <= sr.length - 5; i++) if (sr[i + 4] - sr[i] === 4 && new Set(sr.slice(i, i + 5)).size === 5) isStraight = true;
  if (sr.includes(14) && sr.includes(2) && sr.includes(3) && sr.includes(4) && sr.includes(5)) isStraight = true;

  if (isFlush && isStraight) {
    const fs = Object.entries(sc).find(([, c]) => c >= 5)![0];
    const fr = cards.filter(c => c.slice(-1) === fs).map(c => rankValue(c.slice(0, -1))).sort((a, b) => a - b);
    return fr.slice(-5).join() === '8,9,10,11,12' ? { score: 9, nameKey: 'hand.royal_flush' } : { score: 8, nameKey: 'hand.straight_flush' };
  }
  if (counts[0] === 4) return { score: 7, nameKey: 'hand.four_of_a_kind' };
  if (counts[0] === 3 && counts[1] >= 2) return { score: 6, nameKey: 'hand.full_house' };
  if (isFlush) return { score: 5, nameKey: 'hand.flush' };
  if (isStraight) return { score: 4, nameKey: 'hand.straight' };
  if (counts[0] === 3) return { score: 3, nameKey: 'hand.three_of_a_kind' };
  if (counts[0] === 2 && counts[1] === 2) return { score: 2, nameKey: 'hand.two_pair' };
  if (counts[0] === 2) return { score: 1, nameKey: 'hand.pair' };
  return { score: 0, nameKey: 'hand.high_card' };
}

const STAGE_KEYS: Record<string, string> = {
  preflop: 'two.stage.preflop', flop: 'two.stage.flop', turn: 'two.stage.turn', river: 'two.stage.river', showdown: 'two.stage.showdown'
};

interface GameRoom {
  id: string;
  room_code: string;
  stage: string;
  pot: number;
  community: string[];
  revealed: number;
  current_turn: string;
  p1_hand: string[];
  p2_hand: string[];
  p1_chips: number;
  p2_chips: number;
  p1_bet: number;
  p2_bet: number;
  p1_action: string | null;
  p2_action: string | null;
  p1_joined: boolean;
  p2_joined: boolean;
  result: string | null;
  p1_eval: string | null;
  p2_eval: string | null;
  deck: string[];
}

type Phase = 'lobby' | 'waiting' | 'playing';

const TwoPlayer = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerNum, setPlayerNum] = useState<1 | 2>(1);
  const [gameState, setGameState] = useState<GameRoom | null>(null);
  const [error, setError] = useState('');

  const myKey = playerNum === 1 ? 'p1' : 'p2';
  const oppKey = playerNum === 1 ? 'p2' : 'p1';
  const isMyTurn = gameState?.current_turn === myKey;
  const isShowdown = gameState?.stage === 'showdown';

  // Subscribe to game state via Realtime
  useEffect(() => {
    if (!roomCode) return;

    // Initial fetch
    const fetchRoom = async () => {
      const { data } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();
      if (data) {
        setGameState(data as GameRoom);
        if (data.stage !== 'waiting') setPhase('playing');
      }
    };
    fetchRoom();

    // Realtime subscription
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          const data = payload.new as GameRoom;
          setGameState(data);
          if (data.stage !== 'waiting') setPhase('playing');
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  // When both players joined and I'm p1, deal cards
  useEffect(() => {
    if (!gameState || playerNum !== 1) return;
    if (gameState.stage === 'waiting' && gameState.p1_joined && gameState.p2_joined) {
      dealGame();
    }
  }, [gameState?.p2_joined, gameState?.stage]);

  const dealGame = async () => {
    const deck = makeDeck();
    const p1Hand = [deck.pop()!, deck.pop()!];
    const p2Hand = [deck.pop()!, deck.pop()!];
    const community = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!];

    await supabase
      .from('game_rooms')
      .update({
        stage: 'preflop',
        revealed: 0,
        community,
        p1_hand: p1Hand,
        p2_hand: p2Hand,
        deck,
        pot: 40,
        p1_chips: 1000,
        p2_chips: 1000,
        p1_bet: 20,
        p2_bet: 20,
        p1_action: null,
        p2_action: null,
        result: null,
        p1_eval: null,
        p2_eval: null,
        current_turn: 'p1',
      })
      .eq('room_code', roomCode);
  };

  const createRoom = async () => {
    const code = genRoomCode();
    setRoomCode(code);
    setPlayerNum(1);

    await supabase.from('game_rooms').insert({
      room_code: code,
      stage: 'waiting',
      p1_joined: true,
      p2_joined: false,
    });
    setPhase('waiting');
  };

  const joinRoom = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    setError('');

    const { data } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', code)
      .single();

    if (!data) { setError(t('two.lobby.error.notfound')); return; }
    if (data.p2_joined) { setError(t('two.lobby.error.full')); return; }

    setRoomCode(code);
    setPlayerNum(2);

    await supabase
      .from('game_rooms')
      .update({ p2_joined: true })
      .eq('room_code', code);

    setPhase('waiting');
  };

  const doAction = async (action: string) => {
    if (!gameState || !isMyTurn) return;

    let newPot = gameState.pot;
    if (action === 'call') newPot += 20;
    if (action === 'raise') newPot += 60;

    const actionField = myKey === 'p1' ? { p1_action: action } : { p2_action: action };

    if (action === 'fold') {
      await supabase
        .from('game_rooms')
        .update({
          stage: 'showdown',
          revealed: 5,
          ...actionField,
          result: oppKey === 'p1' ? 'p1wins' : 'p2wins',
          pot: newPot,
        } as any)
        .eq('room_code', roomCode);
      return;
    }

    const stages = ['preflop', 'flop', 'turn', 'river', 'showdown'];
    const si = stages.indexOf(gameState.stage);
    const nextStage = stages[Math.min(si + 1, 4)];
    const newRevealed = nextStage === 'flop' ? 3 : nextStage === 'turn' ? 4 : 5;

    if (nextStage === 'showdown') {
      const p1Eval = evaluateHand([...gameState.p1_hand, ...gameState.community]);
      const p2Eval = evaluateHand([...gameState.p2_hand, ...gameState.community]);
      const result = p1Eval.score > p2Eval.score ? 'p1wins' : p2Eval.score > p1Eval.score ? 'p2wins' : 'tie';
      await supabase
        .from('game_rooms')
        .update({
          stage: 'showdown',
          revealed: 5,
          pot: newPot,
          ...actionField,
          result,
          p1_eval: p1Eval.nameKey,
          p2_eval: p2Eval.nameKey,
          current_turn: oppKey,
        } as any)
        .eq('room_code', roomCode);
    } else {
      await supabase
        .from('game_rooms')
        .update({
          stage: nextStage,
          revealed: newRevealed,
          pot: newPot,
          ...actionField,
          current_turn: oppKey,
        } as any)
        .eq('room_code', roomCode);
    }
  };

  const newRound = async () => {
    if (playerNum === 1) {
      await supabase
        .from('game_rooms')
        .update({ stage: 'waiting', p1_joined: true, p2_joined: true })
        .eq('room_code', roomCode);
      // dealGame will be triggered by the useEffect
      setTimeout(() => dealGame(), 500);
    }
  };

  const shareRoom = () => {
    const url = window.location.origin + import.meta.env.BASE_URL + 'multiplayer';
    const text = t('two.share.text', { code: roomCode, url });
    if (navigator.share) {
      navigator.share({ text, title: t('two.share.title') });
    } else {
      navigator.clipboard.writeText(t('two.share.copy', { code: roomCode, url }));
    }
  };

  const myHand = gameState ? (myKey === 'p1' ? gameState.p1_hand : gameState.p2_hand) : [];
  const oppHand = gameState ? (oppKey === 'p1' ? gameState.p1_hand : gameState.p2_hand) : [];
  const communityShow = gameState?.community?.slice(0, gameState.revealed) ?? [];

  // ── LOBBY ──
  if (phase === 'lobby') {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-3 py-2 border-b border-border">
          <button onClick={() => navigate('/')} className="text-primary"><ArrowRight size={20} /></button>
          <h1 className="text-sm font-heading font-bold text-primary">{t('two.title')}</h1>
          <div className="w-5" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center space-y-2">
            <p className="text-4xl">👥</p>
            <h2 className="text-xl font-heading font-bold text-primary">{t('two.lobby.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('two.lobby.subtitle')}</p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={createRoom}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              {t('two.lobby.create')}
            </button>

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs text-muted-foreground text-center">{t('two.lobby.join.label')}</p>
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={t('two.lobby.join.placeholder')}
                className="w-full px-3 py-2.5 rounded-lg border border-primary/30 bg-secondary/50 text-foreground text-center text-lg tracking-widest font-heading font-bold placeholder:text-muted-foreground/50 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-primary"
              />
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <button
                onClick={joinRoom}
                className="w-full py-2.5 rounded-lg bg-secondary text-foreground font-heading font-bold text-sm border border-primary/30 hover:bg-secondary/80 transition-colors"
              >
                {t('two.lobby.join.btn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING ──
  if (phase === 'waiting') {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-3 py-2 border-b border-border">
          <button onClick={() => { setPhase('lobby'); setRoomCode(''); }} className="text-primary"><ArrowRight size={20} /></button>
          <h1 className="text-sm font-heading font-bold text-primary">{t('two.waiting.title')}</h1>
          <div className="w-5" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <p className="text-4xl animate-pulse">⏳</p>
          <p className="text-sm text-muted-foreground">
            {playerNum === 1 ? t('two.waiting.player') : t('two.waiting.dealer')}
          </p>

          {playerNum === 1 && (
            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground">{t('two.waiting.send')}</p>
              <div className="bg-card rounded-lg p-4 gold-border">
                <p className="text-2xl font-heading font-bold text-primary tracking-[0.3em]">{roomCode}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={shareRoom}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <Share2 size={14} /> {t('two.waiting.share')}
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(roomCode); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs font-bold hover:bg-secondary/80 transition-colors"
                >
                  <Copy size={14} /> {t('two.waiting.copy')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GAME ──
  const myResult = gameState?.result;
  const iWon = myResult === (myKey === 'p1' ? 'p1wins' : 'p2wins');
  const iLost = myResult === (myKey === 'p1' ? 'p2wins' : 'p1wins');
  const myChips = myKey === 'p1' ? (gameState?.p1_chips ?? 1000) : (gameState?.p2_chips ?? 1000);
  const oppChips = oppKey === 'p1' ? (gameState?.p1_chips ?? 1000) : (gameState?.p2_chips ?? 1000);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-border">
        <button onClick={() => navigate('/')} className="text-primary"><ArrowRight size={20} /></button>
        <h1 className="text-sm font-heading font-bold text-primary">{t('two.game.player', { n: playerNum })}</h1>
        <span className="text-[10px] text-muted-foreground">#{roomCode}</span>
      </header>

      <div className="flex-1 flex flex-col p-2 gap-1.5 overflow-hidden">
        {/* Chips & pot */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-primary font-bold">💰 {myChips}</span>
          <span className="text-foreground font-heading font-bold">{t('two.game.pot', { n: gameState?.pot ?? 0 })}</span>
          <span className="text-muted-foreground">👤 {oppChips}</span>
        </div>

        {/* Stage bar */}
        <div className="flex gap-1">
          {['preflop', 'flop', 'turn', 'river'].map((n, i) => {
            const si = ['preflop', 'flop', 'turn', 'river', 'showdown'].indexOf(gameState?.stage ?? 'preflop');
            return (
              <div key={n} className={`flex-1 h-1 rounded-full ${i <= si ? 'bg-primary' : 'bg-secondary'}`} />
            );
          })}
        </div>

        {/* Opponent */}
        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">{t('two.game.opp.label', { n: playerNum === 1 ? 2 : 1 })}</p>
          <div className="flex gap-1 justify-center">
            {isShowdown && oppHand.length > 0
              ? oppHand.map((c, i) => <PlayingCard key={i} card={parseCardStr(c)} />)
              : [0, 1].map(i => <PlayingCard key={i} card={{ rank: '2', suit: '♠' }} hidden />)
            }
          </div>
          {isShowdown && gameState && (
            <p className="text-[10px] text-primary mt-1">
              {t(oppKey === 'p1' ? (gameState.p1_eval ?? '') : (gameState.p2_eval ?? ''))}
            </p>
          )}
        </div>

        {/* Community cards */}
        <div className="bg-secondary/50 rounded-lg p-2 gold-border">
          <p className="text-[10px] text-muted-foreground mb-1 text-center">
            {t('two.game.board', { stage: t(STAGE_KEYS[gameState?.stage ?? 'preflop']) })}
          </p>
          <div className="flex gap-1.5 justify-center min-h-[3.5rem] items-center">
            {communityShow.map((c, i) => (
              <PlayingCard key={i} card={parseCardStr(c)} />
            ))}
            {Array(5 - communityShow.length).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="w-[42px] h-[60px] rounded-md border border-dashed border-muted-foreground/20 flex items-center justify-center">
                <span className="text-muted-foreground/30 text-xs">?</span>
              </div>
            ))}
          </div>
        </div>

        {/* My hand */}
        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">{t('two.game.your.cards')}</p>
          <div className="flex gap-1 justify-center">
            {myHand.map((c, i) => (
              <PlayingCard key={i} card={parseCardStr(c)} />
            ))}
          </div>
        </div>

        {/* Turn indicator */}
        <div className="bg-card rounded-lg p-2 gold-border text-center">
          <p className={`text-xs font-heading font-bold ${isShowdown ? 'text-primary' : isMyTurn ? 'text-green-400' : 'text-yellow-400'}`}>
            {isShowdown ? '' : isMyTurn ? t('two.game.your.turn') : t('two.game.waiting.opp')}
          </p>
        </div>

        {/* Result */}
        {isShowdown && myResult && (
          <div className={`rounded-lg p-3 text-center ${iWon ? 'bg-green-500/15' : iLost ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
            <p className="text-2xl">{iWon ? '🏆' : iLost ? '💸' : '🤝'}</p>
            <p className="font-heading font-bold text-sm mt-1">
              {iWon ? t('two.game.you.won') : iLost ? t('two.game.you.lost') : myResult === 'tie' ? t('two.game.tie') : ''}
            </p>
            {gameState?.p1_eval && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('two.game.eval.row', { p1: t(gameState.p1_eval), p2: t(gameState.p2_eval ?? '') })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border p-3 pt-2">
        {!isShowdown ? (
          <div className="flex gap-2">
            <button
              onClick={() => doAction('call')}
              disabled={!isMyTurn}
              className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-heading font-bold border border-primary/30 hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              {t('two.game.btn.call')}
            </button>
            <button
              onClick={() => doAction('raise')}
              disabled={!isMyTurn}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {t('two.game.btn.raise')}
            </button>
            <button
              onClick={() => doAction('fold')}
              disabled={!isMyTurn}
              className="flex-1 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-heading font-bold hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              {t('two.game.btn.fold')}
            </button>
          </div>
        ) : (
          <button
            onClick={newRound}
            disabled={playerNum !== 1}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {playerNum === 1 ? t('two.game.btn.new') : t('two.game.btn.waiting')}
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoPlayer;
