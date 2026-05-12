import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { trackHandStart, trackHandResult } from '@/lib/analytics';
import {
  createGame,
  playerAction,
  advancePhase,
  getAvailableActions,
  getPhaseKey,
  getActionKey,
  calculateEquity,
  type GameState,
  type Action,
} from '@/lib/pokerEngine';
import { botActionWithAggression } from '@/lib/botAI';
import PlayingCard from '@/components/poker/PlayingCard';
import GlossaryText from '@/components/poker/GlossaryText';
import { ArrowRight, Swords } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

type AggressionLevel = 1 | 2 | 3 | 4 | 5;

const BotBattle = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [aggression, setAggression] = useState<AggressionLevel>(3);
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<GameState>(createGame());
  const [message, setMessage] = useState('');
  const [botThinking, setBotThinking] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | 'tie' | null>(null);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [wins, setWins] = useState(0);

  const aggressionLabels: Record<AggressionLevel, { en: string; he: string }> = {
    1: { en: 'Very Passive', he: 'פסיבי מאוד' },
    2: { en: 'Passive', he: 'פסיבי' },
    3: { en: 'Balanced', he: 'מאוזן' },
    4: { en: 'Aggressive', he: 'אגרסיבי' },
    5: { en: 'Maniac', he: 'מניאק' },
  };

  const startGame = () => {
    const newGame = createGame();
    setGame(newGame);
    setStarted(true);
    setResult(null);
    setMessage(t('bot.welcome'));
    trackHandStart();
  };

  const handleNewHand = () => {
    const newGame = createGame();
    setGame(newGame);
    setResult(null);
    setMessage(t('bot.new.hand'));
    trackHandStart();
  };

  const finishHand = useCallback((state: GameState) => {
    const r = state.winner === 'player' ? 'win' : state.winner === 'bot' ? 'loss' : 'tie';
    setResult(r);
    setHandsPlayed(p => p + 1);
    if (r === 'win') setWins(w => w + 1);
    trackHandResult(r, state.pot);
  }, []);

  const handleAction = useCallback((action: Action) => {
    let newState = playerAction(game, action);
    setMessage(`${t('guided.chose')} ${t(getActionKey(action))}`);

    if (newState.phase === 'finished') {
      setGame(newState);
      finishHand(newState);
      return;
    }

    if (!newState.isPlayerTurn) {
      setBotThinking(true);
      setTimeout(() => {
        let afterBot = botActionWithAggression(newState, aggression);

        if (afterBot.phase === 'finished') {
          setGame(afterBot);
          const lastAction = afterBot.actions[afterBot.actions.length - 1];
          setMessage(`${t('guided.bot.did')} ${t(getActionKey(lastAction.action))}.`);
          setBotThinking(false);
          finishHand(afterBot);
          return;
        }

        if (afterBot.isPlayerTurn) {
          const lastAction = afterBot.actions[afterBot.actions.length - 1];
          setMessage(`${t('guided.bot.did')} ${t(getActionKey(lastAction.action))}. ${t('guided.bot.your.turn')}`);
          setGame(afterBot);
          setBotThinking(false);
          return;
        }

        const lastAction = afterBot.actions[afterBot.actions.length - 1];
        setMessage(`${t('guided.bot.did')} ${t(getActionKey(lastAction.action))}.`);

        setTimeout(() => {
          const advanced = advancePhase(afterBot);
          setGame(advanced);

          if (advanced.phase === 'showdown') {
            setMessage(t('guided.showdown'));
            finishHand(advanced);
          } else {
            setMessage(`${t('phase.' + advanced.phase)} ${t('guided.phase.action')}`);
          }
          setBotThinking(false);
        }, 600);
      }, 800);
    }
  }, [game, aggression, t, finishHand]);

  const availableActions = getAvailableActions(game);
  const equity = calculateEquity(game.playerHand, game.communityCards);

  // Setup screen
  if (!started) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-3 py-2 border-b border-border">
          <button onClick={() => navigate('/')} className="text-primary">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-sm font-heading font-bold text-primary">{t('bot.title')}</h1>
          <div className="w-5" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="text-center space-y-2">
            <Swords className="mx-auto text-primary" size={48} />
            <h2 className="text-xl font-heading font-bold text-primary">{t('bot.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('bot.setup.desc')}</p>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('bot.aggression.label')}</p>
              <p className="text-lg font-heading font-bold text-primary">
                {aggressionLabels[aggression][lang]}
              </p>
            </div>

            <Slider
              value={[aggression]}
              onValueChange={([v]) => setAggression(v as AggressionLevel)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>🕊️</span>
              <span>⚖️</span>
              <span>🔥</span>
            </div>

            <div className="bg-card rounded-lg p-3 gold-border text-center space-y-1">
              <p className="text-[11px] text-muted-foreground">{t('bot.aggression.info')}</p>
              <p className="text-xs text-foreground font-bold">
                {aggression <= 2
                  ? t('bot.style.passive')
                  : aggression === 3
                    ? t('bot.style.balanced')
                    : t('bot.style.aggressive')}
              </p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {t('bot.start')}
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border">
        <button onClick={() => navigate('/')} className="text-primary">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-sm font-heading font-bold text-primary">{t('bot.title')}</h1>
        <div className="text-[10px] text-muted-foreground text-center">
          <span>{handsPlayed} {t('bot.hands')} | {wins} {t('bot.wins')}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-2 gap-1.5 overflow-hidden">
        {/* Phase & pot */}
        <div className="flex items-center justify-between">
          <GlossaryText
            text={`${t('phase.' + game.phase)}`}
            className="text-xs text-muted-foreground"
          />
          <span className="text-[10px] text-accent-foreground bg-accent/50 px-2 py-0.5 rounded-full">
            {aggressionLabels[aggression][lang]} 🤖
          </span>
          <GlossaryText
            text={`${t('guided.pot.label')} ${game.pot}`}
            className="text-xs font-bold text-primary"
          />
        </div>

        {/* Bot area */}
        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">{t('guided.bot.label')}</p>
          <div className="flex gap-1 justify-center">
            {game.botHand.map((c, i) => (
              <PlayingCard
                key={i}
                card={c}
                hidden={game.phase !== 'showdown'}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {t('guided.bot.chips')} {game.botChips}
          </p>
          {botThinking && (
            <p className="text-xs text-primary animate-pulse mt-0.5">{t('guided.bot.thinking')}</p>
          )}
        </div>

        {/* Community cards */}
        <div className="bg-secondary/50 rounded-lg p-2 gold-border">
          <p className="text-[10px] text-muted-foreground mb-1 text-center">{t('guided.community')}</p>
          <div className="flex gap-1.5 justify-center min-h-[3.5rem] items-center">
            {game.communityCards.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">{t('guided.community.hidden')}</p>
            ) : (
              game.communityCards.map((c, i) => <PlayingCard key={i} card={c} />)
            )}
          </div>
        </div>

        {/* Player area */}
        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">{t('guided.your.hand')}</p>
          <div className="flex gap-1 justify-center">
            {game.playerHand.map((c, i) => (
              <PlayingCard key={i} card={c} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{t('guided.bot.chips')} {game.playerChips}</span>
            <span className="text-[10px] text-primary font-bold">Equity: {(equity * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-card rounded-lg p-2 gold-border">
          <GlossaryText text={message} className="text-xs text-foreground block text-center" />
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-3 text-center ${result === 'win' ? 'bg-green-500/15' : result === 'loss' ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
            <p className="font-heading font-bold text-sm">
              {result === 'win' ? t('report.win') : result === 'loss' ? t('report.loss') : t('report.tie')}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {game.winningHandName}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border p-3 pt-2 space-y-2">
        {result ? (
          <div className="flex gap-2">
            <button
              onClick={handleNewHand}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-heading font-bold hover:bg-primary/90 transition-colors"
            >
              {t('bot.next.hand')}
            </button>
            <button
              onClick={() => { setStarted(false); }}
              className="py-2.5 px-4 rounded-lg bg-secondary text-foreground text-sm font-heading font-bold hover:bg-secondary/80 border border-primary/30 transition-colors"
            >
              {t('bot.change.level')}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {availableActions.map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={botThinking}
                className={`flex-1 py-2.5 rounded-lg text-sm font-heading font-bold transition-colors disabled:opacity-50
                  ${action === 'fold'
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                    : action === 'raise'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-primary/30'
                  }`}
              >
                {t(getActionKey(action))}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotBattle;
