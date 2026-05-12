import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackHandStart, trackHandResult } from '@/lib/analytics';
import AiCoachChat from '@/components/poker/AiCoachChat';
import {
  createGame,
  playerAction,
  botAction,
  advancePhase,
  getAvailableActions,
  getPhaseKey,
  getActionKey,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
  type GameState,
  type Action,
} from '@/lib/pokerEngine';
import PlayingCard from '@/components/poker/PlayingCard';
import GlossaryText from '@/components/poker/GlossaryText';
import AnalystReport from '@/components/poker/AnalystReport';
import HintPanel from '@/components/poker/HintPanel';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const GuidedGame = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [game, setGame] = useState<GameState>(createGame());
  const [message, setMessage] = useState(t('guided.message.welcome'));
  const [showReport, setShowReport] = useState(false);
  const [botThinking, setBotThinking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleAction = useCallback((action: Action) => {
    let newState = playerAction(game, action);
    setMessage(t('guided.message.chose', { action: t(getActionKey(action)) }));

    if (newState.phase === 'finished') {
      setGame(newState);
      const result = newState.winner === 'player' ? 'win' : newState.winner === 'bot' ? 'loss' : 'tie';
      trackHandResult(result, newState.pot);
      setTimeout(() => setShowReport(true), 800);
      return;
    }

    if (!newState.isPlayerTurn) {
      setBotThinking(true);
      setTimeout(() => {
        let afterBot = botAction(newState);

        if (afterBot.phase === 'finished') {
          setGame(afterBot);
          const lastBotAction = afterBot.actions[afterBot.actions.length - 1];
          setMessage(t('guided.message.bot.did', { action: t(getActionKey(lastBotAction.action)) }));
          setBotThinking(false);
          const result = afterBot.winner === 'player' ? 'win' : afterBot.winner === 'bot' ? 'loss' : 'tie';
          trackHandResult(result, afterBot.pot);
          setTimeout(() => setShowReport(true), 800);
          return;
        }

        if (afterBot.isPlayerTurn) {
          const lastBotAction = afterBot.actions[afterBot.actions.length - 1];
          setMessage(t('guided.message.bot.your.turn', { action: t(getActionKey(lastBotAction.action)) }));
          setGame(afterBot);
          setBotThinking(false);
          return;
        }

        const lastBotAction = afterBot.actions[afterBot.actions.length - 1];
        setMessage(t('guided.message.bot.did', { action: t(getActionKey(lastBotAction.action)) }));

        setTimeout(() => {
          const advanced = advancePhase(afterBot);
          setGame(advanced);

          if (advanced.phase === 'showdown') {
            setMessage(t('guided.message.showdown'));
            setTimeout(() => setShowReport(true), 1200);
          } else {
            setMessage(t('guided.message.phase', { phase: t(getPhaseKey(advanced.phase)) }));
          }
          setBotThinking(false);
        }, 600);
      }, 800);
    }
  }, [game, t]);

  const handleNewGame = () => {
    const newGame = createGame();
    setGame(newGame);
    setShowReport(false);
    setMessage(t('guided.message.new'));
    trackHandStart();
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
          <h1 className="text-sm font-heading font-bold text-primary">{t('guided.report.title')}</h1>
          <div className="w-5" />
        </header>
        <div className="flex-1 overflow-hidden">
          <AnalystReport game={game} onNewGame={handleNewGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border">
        <button onClick={() => navigate('/')} className="text-primary">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-sm font-heading font-bold text-primary">{t('guided.title')}</h1>
        <div className="w-5" />
      </header>

      <div className="flex-1 flex flex-col p-2 gap-1.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <GlossaryText
            text={t('guided.phase.label', { phase: t(getPhaseKey(game.phase)) })}
            className="text-xs text-muted-foreground"
          />
          <GlossaryText
            text={t('guided.pot.full', { n: game.pot })}
            className="text-xs font-bold text-primary"
          />
        </div>

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

        <div className="bg-secondary/50 rounded-lg p-2 gold-border">
          <p className="text-[10px] text-muted-foreground mb-1 text-center">{t('guided.community.label')}</p>
          <div className="flex gap-1.5 justify-center min-h-[3.5rem] items-center">
            {game.communityCards.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">{t('guided.community.empty')}</p>
            ) : (
              game.communityCards.map((c, i) => <PlayingCard key={i} card={c} />)
            )}
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">{t('guided.your.hand')}</p>
          <div className="flex gap-1 justify-center">
            {game.playerHand.map((c, i) => (
              <PlayingCard key={i} card={c} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{t('guided.bot.chips')} {game.playerChips}</span>
            <div className="flex items-center gap-1">
              <GlossaryText
                text={t('guided.equity.label')}
                className="text-[10px] text-muted-foreground"
              />
              <span className="text-[10px] text-primary font-bold">{(equity * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {game.communityCards.length >= 3 && game.phase !== 'showdown' && game.phase !== 'finished' && (() => {
          const outsResult = calculateOuts(game.playerHand, game.communityCards);
          const toCall = Math.max(0, game.botBet - game.playerBet);
          const potOddsResult = calculatePotOdds(
            game.pot,
            toCall,
            outsResult.totalOuts,
            outsResult.cardsRemaining,
            game.communityCards.length
          );
          return (
            <div className="bg-secondary/40 rounded-lg p-2 gold-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-heading font-bold text-primary">{t('guided.outs.heading')}</span>
                <span className="text-[10px] text-muted-foreground">{t('guided.pot.label')} {game.pot} | {toCall > 0 ? `${t('guided.call.label')} ${toCall}` : t('guided.free.check')}</span>
              </div>
              {toCall === 0 ? (
                <div className="space-y-0.5">
                  {outsResult.draws.length > 0 && outsResult.draws.map((draw, di) => (
                    <div key={di} className="flex items-center justify-between">
                      <GlossaryText text={t(draw.name)} className="text-[10px] text-foreground" />
                      <span className="text-[10px] text-primary font-bold">{draw.outs} {t('common.outs')}</span>
                    </div>
                  ))}
                  <div className="bg-green-500/15 rounded p-1.5 mt-1">
                    <p className="text-[10px] text-green-400 font-bold text-center">{t('guided.outs.free.check')}</p>
                    {outsResult.totalOuts > 0 && (
                      <p className="text-[9px] text-foreground/70 text-center mt-0.5">
                        {t('guided.outs.free.bonus', { n: outsResult.totalOuts, odds: potOddsResult.outsOdds.toFixed(1) })}
                      </p>
                    )}
                  </div>
                </div>
              ) : outsResult.draws.length > 0 ? (
                <div className="space-y-0.5">
                  {outsResult.draws.map((draw, di) => (
                    <div key={di} className="flex items-center justify-between">
                      <GlossaryText text={t(draw.name)} className="text-[10px] text-foreground" />
                      <span className="text-[10px] text-primary font-bold">{draw.outs} {t('common.outs')}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{t('guided.outs.total', { n: outsResult.totalOuts })}</span>
                    <span className="text-[10px] text-muted-foreground">{t('guided.outs.improve')} <span className="text-primary font-bold">{potOddsResult.outsOdds.toFixed(1)}%</span></span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full rounded-full ${potOddsResult.isCallProfitable ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(potOddsResult.outsOdds, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-foreground/70 mt-0.5">{t(potOddsResult.explanationKey, potOddsResult.explanationParams)}</p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground/70">{t('guided.outs.no.draws')}</p>
              )}
            </div>
          );
        })()}

        <div className="bg-card rounded-lg p-2 gold-border">
          <GlossaryText text={message} className="text-xs text-foreground block text-center" />
        </div>
      </div>

      {showHint && game.phase !== 'showdown' && game.phase !== 'finished' && (
        <div className="absolute inset-0 z-50 bg-background/95 overflow-y-auto">
          <div className="p-3">
            <HintPanel game={game} onClose={() => setShowHint(false)} />
          </div>
        </div>
      )}

      {availableActions.length > 0 && (
        <div className="border-t border-border p-3 pt-2 space-y-2">
          {!showHint && game.phase !== 'showdown' && game.phase !== 'finished' && (
            <button
              onClick={() => setShowHint(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-heading font-bold hover:bg-primary/20 transition-colors"
            >
              <Lightbulb size={14} />
              <span>{t('guided.hint.btn.full')}</span>
            </button>
          )}
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
        </div>
      )}

      <AiCoachChat game={game} />
    </div>
  );
};

export default GuidedGame;
