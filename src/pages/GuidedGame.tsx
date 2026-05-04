import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createGame,
  playerAction,
  botAction,
  advancePhase,
  getAvailableActions,
  getPhaseHebrew,
  getActionHebrew,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
  type GameState,
  type Action,
} from '@/lib/pokerEngine';
import PlayingCard from '@/components/poker/PlayingCard';
import GlossaryText from '@/components/poker/GlossaryText';
import AnalystReport from '@/components/poker/AnalystReport';
import { ArrowRight } from 'lucide-react';

const GuidedGame = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState>(createGame());
  const [message, setMessage] = useState('ברוכים הבאים! בחר פעולה לשלב הפרה-פלופ.');
  const [showReport, setShowReport] = useState(false);
  const [botThinking, setBotThinking] = useState(false);

  const handleAction = useCallback((action: Action) => {
    let newState = playerAction(game, action);
    setMessage(`בחרת: ${getActionHebrew(action)}`);

    if (newState.phase === 'finished') {
      setGame(newState);
      setTimeout(() => setShowReport(true), 800);
      return;
    }

    // Bot turn
    if (!newState.isPlayerTurn) {
      setBotThinking(true);
      setTimeout(() => {
        let afterBot = botAction(newState);
        
        if (afterBot.phase === 'finished') {
          setGame(afterBot);
          const lastBotAction = afterBot.actions[afterBot.actions.length - 1];
          setMessage(`הבוט עשה ${getActionHebrew(lastBotAction.action)}.`);
          setBotThinking(false);
          setTimeout(() => setShowReport(true), 800);
          return;
        }

        if (afterBot.isPlayerTurn) {
          // Bot raised, player needs to respond
          const lastBotAction = afterBot.actions[afterBot.actions.length - 1];
          setMessage(`הבוט עשה ${getActionHebrew(lastBotAction.action)}. תורך!`);
          setGame(afterBot);
          setBotThinking(false);
          return;
        }

        // Both acted, advance phase
        const lastBotAction = afterBot.actions[afterBot.actions.length - 1];
        setMessage(`הבוט עשה ${getActionHebrew(lastBotAction.action)}.`);
        
        setTimeout(() => {
          const advanced = advancePhase(afterBot);
          setGame(advanced);
          
          if (advanced.phase === 'showdown') {
            setMessage(`שואדאון! חשיפת הקלפים...`);
            setTimeout(() => setShowReport(true), 1200);
          } else {
            setMessage(`שלב ה${getPhaseHebrew(advanced.phase)} — בחר פעולה.`);
          }
          setBotThinking(false);
        }, 600);
      }, 800);
    }
  }, [game]);

  const handleNewGame = () => {
    setGame(createGame());
    setShowReport(false);
    setMessage('משחק חדש! בחר פעולה לשלב הפרה-פלופ.');
  };

  const availableActions = getAvailableActions(game);
  const equity = calculateEquity(game.playerHand, game.communityCards);

  if (showReport) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-3 py-2 border-b border-border">
          <button onClick={() => navigate('/')} className="text-primary">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-sm font-heading font-bold text-primary">דו״ח אנליסט</h1>
          <div className="w-5" />
        </header>
        <div className="flex-1 overflow-hidden">
          <AnalystReport game={game} onNewGame={handleNewGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-border">
        <button onClick={() => navigate('/')} className="text-primary">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-sm font-heading font-bold text-primary">משחק מודרך</h1>
        <div className="w-5" />
      </header>

      {/* Game area */}
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* Phase & pot info */}
        <div className="flex items-center justify-between">
          <GlossaryText 
            text={`שלב: ${getPhaseHebrew(game.phase)}`}
            className="text-xs text-muted-foreground"
          />
          <GlossaryText
            text={`פוט: ${game.pot}`}
            className="text-xs font-bold text-primary"
          />
        </div>

        {/* Bot area */}
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-2">🤖 בוט</p>
          <div className="flex gap-1 justify-center">
            {game.botHand.map((c, i) => (
              <PlayingCard 
                key={i} 
                card={c} 
                hidden={game.phase !== 'showdown'} 
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            צ'יפס: {game.botChips}
          </p>
          {botThinking && (
            <p className="text-xs text-primary animate-pulse mt-1">חושב...</p>
          )}
        </div>

        {/* Community cards */}
        <div className="bg-secondary/50 rounded-lg p-3 gold-border">
          <p className="text-[10px] text-muted-foreground mb-2 text-center">קלפים קהילתיים</p>
          <div className="flex gap-1.5 justify-center min-h-[5rem] items-center">
            {game.communityCards.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">טרם נחשפו</p>
            ) : (
              game.communityCards.map((c, i) => <PlayingCard key={i} card={c} />)
            )}
          </div>
        </div>

        {/* Player area */}
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-2">🃏 היד שלך</p>
          <div className="flex gap-1 justify-center">
            {game.playerHand.map((c, i) => (
              <PlayingCard key={i} card={c} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">צ'יפס: {game.playerChips}</span>
            <div className="flex items-center gap-1">
              <GlossaryText 
                text="אקוויטי:" 
                className="text-[10px] text-muted-foreground"
              />
              <span className="text-[10px] text-primary font-bold">{(equity * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-card rounded-lg p-2 gold-border">
          <GlossaryText text={message} className="text-xs text-foreground block text-center" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
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
              {getActionHebrew(action)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidedGame;
