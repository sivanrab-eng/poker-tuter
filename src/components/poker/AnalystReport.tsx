import {
  GameState,
  getPlayerHandEval,
  getBotHandEval,
  getActionKey,
  getPhaseKey,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
} from '@/lib/pokerEngine';
import GlossaryText from './GlossaryText';
import PlayingCard from './PlayingCard';
import { useI18n } from '@/lib/i18n';

interface AnalystReportProps {
  game: GameState;
  onNewGame: () => void;
}

const AnalystReport = ({ game, onNewGame }: AnalystReportProps) => {
  const { t } = useI18n();
  const playerEval = getPlayerHandEval(game);
  const botEval = getBotHandEval(game);
  const playerEquity = calculateEquity(game.playerHand, game.communityCards);

  // Calculate outs & pot odds per phase with real pot/bet values
  const getPhaseAnalysis = () => {
    const phaseNames = ['flop', 'turn', 'river'];
    const communityByPhase: Record<string, typeof game.communityCards> = {
      flop: game.communityCards.slice(0, 3),
      turn: game.communityCards.slice(0, 4),
      river: game.communityCards.slice(0, 5),
    };

    let runningPot = 30;
    const results: { phaseKey: string; cards: typeof game.communityCards; pot: number; toCall: number }[] = [];

    for (const phaseName of phaseNames) {
      if (phaseName === 'flop' && game.communityCards.length < 3) break;
      if (phaseName === 'turn' && game.communityCards.length < 4) break;
      if (phaseName === 'river' && game.communityCards.length < 5) break;

      const prevPhases = phaseName === 'flop' ? ['preflop'] : phaseName === 'turn' ? ['preflop', 'flop'] : ['preflop', 'flop', 'turn'];
      const alreadyCounted = results.length > 0
        ? (phaseName === 'turn' ? ['flop'] : phaseName === 'river' ? ['turn'] : [])
        : prevPhases;

      for (const a of game.actions) {
        if (alreadyCounted.includes(a.phase) && a.amount) {
          runningPot += a.amount;
        }
      }

      const phaseActions = game.actions.filter(a => a.phase === phaseName);
      let toCall = 0;
      let playerBet = 0;
      let botBet = 0;
      for (const a of phaseActions) {
        if (a.actor === 'bot' && a.amount) botBet += a.amount;
        if (a.actor === 'player' && a.amount) playerBet += a.amount;
      }
      toCall = Math.max(0, botBet - playerBet);
      if (toCall === 0) {
        const playerAct = phaseActions.find(a => a.actor === 'player' && a.action === 'call');
        if (playerAct?.amount) toCall = playerAct.amount;
      }

      results.push({
        phaseKey: `phase.${phaseName}`,
        cards: communityByPhase[phaseName],
        pot: runningPot,
        toCall,
      });
    }

    return results;
  };

  const phaseSnapshots = getPhaseAnalysis();

  const getRecommendation = (phaseKey: string, equity: number): string => {
    const phase = t(phaseKey);
    const n = (equity * 100).toFixed(0);
    if (equity > 0.65) return t('report.rec.raise', { phase, n });
    if (equity > 0.45) return t('report.rec.call', { phase, n });
    if (equity > 0.3) return t('report.rec.checkcall', { phase, n });
    return t('report.rec.fold', { phase, n });
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-right h-full overflow-y-auto">
      <h2 className="text-lg font-heading font-bold text-primary text-center">{t('report.heading')}</h2>

      {/* Result */}
      <div className="bg-secondary/50 rounded-lg p-3 gold-border">
        <h3 className="text-sm font-heading font-bold text-primary mb-1">
          {game.winner === 'player' ? t('report.win.title') : game.winner === 'bot' ? t('report.loss.title') : t('report.tie.title')}
        </h3>
        <GlossaryText
          text={t('report.win.summary', { name: t(game.winningHandName), pot: game.pot })}
          className="text-xs text-muted-foreground"
        />
      </div>

      {/* Cards review */}
      {(game.phase === 'showdown' || game.phase === 'finished') && game.winner !== 'player' && game.actions.some(a => a.action === 'fold' && a.actor === 'player') ? null : (
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-heading font-bold text-primary mb-2">{t('report.cards.heading')}</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 text-center">{t('report.cards.you')}</p>
              <div className="flex gap-1 justify-center">
                {game.playerHand.map((c, i) => <PlayingCard key={i} card={c} small />)}
              </div>
              {playerEval && <p className="text-[10px] text-primary mt-1 text-center">{t(playerEval.name)}</p>}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 text-center">{t('report.cards.bot')}</p>
              <div className="flex gap-1 justify-center">
                {game.botHand.map((c, i) => <PlayingCard key={i} card={c} small />)}
              </div>
              {botEval && <p className="text-[10px] text-primary mt-1 text-center">{t(botEval.name)}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Chronological action timeline */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-2">{t('report.timeline.heading')}</h3>
        <div className="space-y-0.5">
          {(() => {
            let runPot = 30;
            const rows: React.ReactNode[] = [];
            let prevPhase = '';

            for (const a of game.actions) {
              if (a.phase !== prevPhase) {
                if (prevPhase !== '') {
                  rows.push(<div key={`div-${a.phase}`} className="border-t border-primary/10 my-1" />);
                }
                rows.push(
                  <p key={`hdr-${a.phase}`} className="text-[10px] font-heading font-bold text-primary/70 mb-0.5">
                    {t(getPhaseKey(a.phase))}
                  </p>
                );
                prevPhase = a.phase;
              }

              if (a.amount) runPot += a.amount;

              const isPlayer = a.actor === 'player';
              const icon = isPlayer ? '🃏' : '🤖';
              const label = isPlayer ? t('report.timeline.you') : t('report.timeline.bot');

              rows.push(
                <div
                  key={rows.length}
                  className={`flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded ${isPlayer ? 'bg-primary/5' : 'bg-secondary/50'}`}
                >
                  <span className="text-foreground">
                    {icon} <span className="font-bold">{label}</span>:{' '}
                    <GlossaryText text={t(getActionKey(a.action))} className="inline" />
                    {a.amount ? ` (${a.amount})` : ''}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{t('common.pot')} {runPot}</span>
                </div>
              );
            }

            return rows;
          })()}
        </div>
        <div className="mt-2 pt-2 border-t border-primary/20">
          <p className="text-[10px] text-muted-foreground">
            {t('report.timeline.decided')} <span className="text-primary font-bold">{t(getPhaseKey(
              game.actions.length > 0 ? game.actions[game.actions.length - 1].phase : game.phase
            ))}</span>
            {game.winner === 'player' && game.actions[game.actions.length - 1]?.action === 'fold' && (
              <span className="text-green-400">{t('report.timeline.bot.folded')}</span>
            )}
            {game.winner === 'bot' && game.actions[game.actions.length - 1]?.action === 'fold' && (
              <span className="text-red-400">{t('report.timeline.you.folded')}</span>
            )}
          </p>
        </div>
      </div>

      {/* What the analyst would do */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-1">{t('report.analyst.heading')}</h3>
        <GlossaryText
          text={getRecommendation(getPhaseKey(game.phase === 'finished' ? 'preflop' : game.phase), playerEquity)}
          className="text-xs text-foreground"
        />
      </div>

      {/* Outs & Pot Odds per phase */}
      {phaseSnapshots.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-heading font-bold text-primary mb-2">{t('report.outs.heading')}</h3>
          <div className="space-y-3">
            {phaseSnapshots.map((snapshot, idx) => {
              const outsResult = calculateOuts(game.playerHand, snapshot.cards);
              const potOddsResult = calculatePotOdds(
                snapshot.pot,
                snapshot.toCall,
                outsResult.totalOuts,
                outsResult.cardsRemaining,
                snapshot.cards.length
              );

              return (
                <div key={idx} className="border-t border-primary/20 pt-2 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-heading font-bold text-primary">{t(snapshot.phaseKey)}</span>
                    <div className="flex gap-1">
                      {snapshot.cards.map((c, ci) => (
                        <PlayingCard key={ci} card={c} small />
                      ))}
                    </div>
                  </div>

                  <div className="bg-card/30 rounded p-2 mb-1.5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('report.outs.pot')}</span>
                      <span className="text-[10px] text-primary font-bold">{snapshot.pot}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('report.outs.callcost')}</span>
                      <span className="text-[10px] text-primary font-bold">{snapshot.toCall}</span>
                    </div>
                    {snapshot.toCall > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{t('report.outs.potodds')}</span>
                        <span className="text-[10px] text-primary font-bold">{potOddsResult.potOdds.toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{t('report.outs.potodds').replace(/\s*\([^)]*\)\s*:?$/, ':')}</span>
                        <span className="text-[10px] text-green-400 font-bold">{t('report.outs.free')}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('report.outs.remaining')}</span>
                      <span className="text-[10px] text-primary font-bold">{outsResult.cardsRemaining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('report.outs.totalouts')}</span>
                      <span className="text-[10px] text-primary font-bold">{outsResult.totalOuts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('report.outs.improve.next')}</span>
                      <span className="text-[10px] text-primary font-bold">{potOddsResult.outsOdds.toFixed(1)}%</span>
                    </div>
                    {snapshot.cards.length === 3 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{t('report.outs.improve.river')}</span>
                        <span className="text-[10px] text-primary font-bold">{potOddsResult.outsOddsRunout.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {outsResult.draws.length > 0 ? (
                    <div className="space-y-1 mb-1.5">
                      {outsResult.draws.map((draw, di) => (
                        <div key={di} className="flex items-center justify-between">
                          <GlossaryText
                            text={t(draw.name)}
                            className="text-[10px] text-foreground"
                          />
                          <span className="text-[10px] text-primary font-bold">{t('report.outs.outslabel', { n: draw.outs })}</span>
                        </div>
                      ))}

                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {snapshot.cards.length === 3 ? t('report.outs.improve.toriver') : t('report.outs.improve')}
                          </span>
                          <span className="text-[10px] text-primary font-bold">
                            {snapshot.cards.length === 3 ? potOddsResult.outsOddsRunout.toFixed(1) : potOddsResult.outsOdds.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${potOddsResult.isCallProfitable ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(snapshot.cards.length === 3 ? potOddsResult.outsOddsRunout : potOddsResult.outsOdds, 100)}%` }}
                          />
                        </div>
                      </div>

                      {snapshot.toCall === 0 ? (
                        <div className="mt-1 px-2 py-1.5 rounded bg-green-500/20 text-green-400 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold">
                            <span>{t('report.outs.free.heading')}</span>
                          </div>
                          <div className="text-[9px] text-green-300/80 leading-relaxed space-y-0.5">
                            <p>{t('report.outs.free.calc1', { pot: snapshot.pot })}</p>
                            <p>{t('report.outs.free.calc2', { pot: snapshot.pot })}</p>
                            <p>{t('report.outs.free.calc3', { outs: outsResult.totalOuts, remaining: outsResult.cardsRemaining })}</p>
                            <p>{t('report.outs.free.calc4', { outs: outsResult.totalOuts, remaining: outsResult.cardsRemaining, odds: potOddsResult.outsOdds.toFixed(1) })}</p>
                            {snapshot.cards.length === 3 && (
                              <p>{t('report.outs.free.calc5', { runout: potOddsResult.outsOddsRunout.toFixed(1) })}</p>
                            )}
                            <p>{t('report.outs.free.calc6')}</p>
                          </div>
                          <div className="mt-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[9px] text-green-300/90 leading-relaxed space-y-0.5">
                            <p>{t('report.outs.free.example.heading')}</p>
                            <p>{t('report.outs.free.example1', { pot: snapshot.pot })}</p>
                            <p>{t('report.outs.free.example2', { outs: outsResult.totalOuts, remaining: outsResult.cardsRemaining })}</p>
                            {outsResult.totalOuts > 0 ? (
                              <>
                                <p>{t('report.outs.free.example3', { outs: outsResult.totalOuts, remaining: outsResult.cardsRemaining, odds: potOddsResult.outsOdds.toFixed(1) })}</p>
                                {snapshot.cards.length === 3 && (
                                  <p>{t('report.outs.free.example4', { runout: potOddsResult.outsOddsRunout.toFixed(1), ruleOf4: outsResult.totalOuts * 4 })}</p>
                                )}
                                <p>{t('report.outs.free.example5', { odds: potOddsResult.outsOdds.toFixed(1) })}</p>
                              </>
                            ) : (
                              <p>{t('report.outs.free.example.no.outs')}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1 mt-1 px-2 py-1 rounded text-[10px] font-bold ${potOddsResult.isCallProfitable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          <span>{potOddsResult.isCallProfitable ? '✅' : '❌'}</span>
                          <span>{potOddsResult.isCallProfitable ? t('report.outs.profitable') : t('report.outs.unprofitable')}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/70 mb-1">{t('report.outs.no.draws')}</p>
                  )}

                  <GlossaryText
                    text={t(potOddsResult.explanationKey, potOddsResult.explanationParams)}
                    className="text-[10px] text-foreground/80"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Equity bar */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-1">{t('report.equity.heading')}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{t('report.equity.label')}</span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${playerEquity * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-primary font-bold">{(playerEquity * 100).toFixed(0)}%</span>
        </div>
      </div>

      <button
        onClick={onNewGame}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
      >
        {t('report.newgame')}
      </button>
    </div>
  );
};

export default AnalystReport;
