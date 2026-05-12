import { useState } from 'react';
import { X } from 'lucide-react';
import {
  GameState,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
  getPhaseKey,
} from '@/lib/pokerEngine';
import { useI18n } from '@/lib/i18n';

interface HintPanelProps {
  game: GameState;
  onClose: () => void;
}

interface VariableItemProps {
  label: string;
  value: string;
  explanation: string;
}

const VariableItem = ({ label, value, explanation }: VariableItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-primary/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 px-1 text-right"
      >
        <span className="text-xs text-primary font-bold underline decoration-primary/40 cursor-pointer">
          {label}
        </span>
        <span className="text-xs text-foreground font-bold">{value}</span>
      </button>
      {open && (
        <div className="px-2 pb-2 text-[10px] text-foreground/80 leading-relaxed bg-card/40 rounded-b mb-1 whitespace-pre-line">
          {explanation}
        </div>
      )}
    </div>
  );
};

type SimAction = 'call' | 'raise' | 'fold';

const HintPanel = ({ game, onClose }: HintPanelProps) => {
  const { t } = useI18n();

  const toCall = Math.max(0, game.botBet - game.playerBet);
  const equity = calculateEquity(game.playerHand, game.communityCards);
  const hasCommunity = game.communityCards.length >= 3;
  const outsResult = hasCommunity
    ? calculateOuts(game.playerHand, game.communityCards)
    : null;
  const potOddsResult =
    hasCommunity && outsResult
      ? calculatePotOdds(
          game.pot,
          toCall,
          outsResult.totalOuts,
          outsResult.cardsRemaining,
          game.communityCards.length
        )
      : null;

  const phase = t(getPhaseKey(game.phase));
  const equityPct = (equity * 100).toFixed(0);
  const improvePct = potOddsResult?.outsOdds.toFixed(1) ?? '—';
  const potOddsPct = potOddsResult?.potOdds.toFixed(1) ?? '—';
  const outsCount = outsResult?.totalOuts ?? 0;
  const raiseSize = Math.max(toCall * 2, Math.round(game.pot * 0.6));

  const getActionAnalysis = (action: SimAction): { rating: 'good' | 'neutral' | 'bad'; title: string; lines: string[] } => {
    if (action === 'fold') {
      const invested = game.playerBet;
      const lines: string[] = [
        t('hint.fold.line.heading'),
        t('hint.fold.line.giveup', { pot: game.pot }),
        t('hint.fold.line.invested', { n: invested }),
        t('hint.fold.line.equity', {
          n: equityPct,
          note: Number(equityPct) > 40 ? t('hint.fold.line.equity.high') : t('hint.fold.line.equity.low'),
        }),
      ];
      if (potOddsResult) {
        lines.push(t('hint.fold.line.potodds', { pot: potOddsPct, improve: improvePct }));
        lines.push(potOddsResult.isCallProfitable
          ? t('hint.fold.line.profitable')
          : t('hint.fold.line.unprofitable', { n: toCall }));
      } else {
        lines.push(Number(equityPct) < 30
          ? t('hint.fold.line.weak')
          : t('hint.fold.line.consider'));
      }
      const rating = (potOddsResult?.isCallProfitable || Number(equityPct) > 50) ? 'bad' : Number(equityPct) < 30 ? 'good' : 'neutral';
      return { rating, title: t('hint.action.fold.title'), lines };
    }

    if (action === 'call') {
      const newPot = game.pot + toCall;
      const label = toCall === 0 ? t('hint.call.line.label.free') : t('hint.call.line.label.cost', { n: toCall });
      const lines: string[] = [
        t('hint.call.line.heading', { label }),
        t('hint.call.line.newpot', { pot: game.pot, tocall: toCall, newpot: newPot }),
      ];
      if (toCall === 0) {
        lines.push(t('hint.call.line.zero.cost'));
        lines.push(t('hint.call.line.equity', { n: equityPct }));
        lines.push(t('hint.call.line.zero.right'));
        if (outsCount > 0) {
          lines.push(t('hint.call.line.zero.outs', { n: outsCount, improve: improvePct }));
        }
        return { rating: 'good', title: t('hint.action.call.title'), lines };
      }
      lines.push(t('hint.call.line.potodds', { tocall: toCall, newpot: newPot, potodds: potOddsPct }));
      lines.push(t('hint.call.line.outs', { n: outsCount, improve: improvePct }));
      lines.push(t('hint.call.line.equity', { n: equityPct }));
      if (potOddsResult?.isCallProfitable) {
        lines.push(t('hint.call.line.profitable', { improve: improvePct, potodds: potOddsPct }));
        lines.push(t('hint.call.line.profitable.long'));
      } else {
        lines.push(t('hint.call.line.unprofitable', { improve: improvePct, potodds: potOddsPct }));
        lines.push(t('hint.call.line.unprofitable.long'));
      }
      const rating = potOddsResult?.isCallProfitable ? 'good' : 'bad';
      return { rating, title: t('hint.action.callcost.title'), lines };
    }

    // raise
    const newPot = game.pot + toCall + raiseSize;
    const lines: string[] = [
      t('hint.raise.line.heading', { size: raiseSize }),
      t('hint.raise.line.cost', { tocall: toCall, size: raiseSize, total: toCall + raiseSize }),
      t('hint.raise.line.newpot', { newpot: newPot }),
      t('hint.raise.line.equity', { n: equityPct }),
    ];
    if (outsCount > 0) {
      lines.push(t('hint.raise.line.outs', { outs: outsCount, improve: improvePct }));
    }
    if (Number(equityPct) > 55) {
      lines.push(t('hint.raise.line.strong', { n: equityPct }));
      lines.push(t('hint.raise.line.strong.long'));
    } else if (Number(equityPct) > 40) {
      lines.push(t('hint.raise.line.semibluff', { n: equityPct }));
      lines.push(t('hint.raise.line.semibluff.long'));
    } else {
      lines.push(t('hint.raise.line.risky', { n: equityPct }));
      lines.push(t('hint.raise.line.risky.long', { total: toCall + raiseSize }));
    }
    const rating = Number(equityPct) > 55 ? 'good' : Number(equityPct) > 40 ? 'neutral' : 'bad';
    return { rating, title: t('hint.action.raise.title'), lines };
  };

  const getRecommendation = (): { action: string; reason: string } => {
    if (toCall === 0) {
      return {
        action: t('hint.rec.check.action'),
        reason: t('hint.rec.check.reason', { equity: equityPct }),
      };
    }
    if (potOddsResult?.isCallProfitable) {
      return {
        action: t('hint.rec.call.action'),
        reason: t('hint.rec.call.reason', { improve: improvePct, potodds: potOddsPct }),
      };
    }
    if (equity > 0.55) {
      return {
        action: t('hint.rec.raise.action'),
        reason: t('hint.rec.raise.reason', { equity: equityPct }),
      };
    }
    if (potOddsResult && !potOddsResult.isCallProfitable) {
      return {
        action: t('hint.rec.fold.action'),
        reason: t('hint.rec.fold.reason', { improve: improvePct, potodds: potOddsPct }),
      };
    }
    if (equity < 0.3) {
      return {
        action: t('hint.rec.fold2.action'),
        reason: t('hint.rec.fold2.reason', { equity: equityPct }),
      };
    }
    return {
      action: t('hint.rec.callsoft.action'),
      reason: t('hint.rec.callsoft.reason', { equity: equityPct }),
    };
  };

  const recommendation = getRecommendation();

  const ratingColor = (r: 'good' | 'neutral' | 'bad') =>
    r === 'good' ? 'bg-green-500/15 border-green-500/30 text-green-400' :
    r === 'bad' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
    'bg-yellow-500/15 border-yellow-500/30 text-yellow-400';

  const ratingIcon = (r: 'good' | 'neutral' | 'bad') =>
    r === 'good' ? '✅' : r === 'bad' ? '❌' : '⚠️';

  const callAnalysis = getActionAnalysis('call');
  const raiseAnalysis = getActionAnalysis('raise');
  const foldAnalysis = getActionAnalysis('fold');

  const newPotCall = game.pot + toCall;
  const raiseCost = toCall + raiseSize;
  const newPotRaise = game.pot + raiseCost;

  const callPotOdds = toCall === 0 ? '0%' : `${potOddsPct}%`;
  const raisePotOdds = `${(raiseCost / (newPotRaise + raiseCost) * 100).toFixed(1)}%`;

  // Outs explanation lines for VariableItem
  const outsExpLines = outsResult && outsResult.draws.length > 0
    ? outsResult.draws.map(d => t('hint.var.outs.line', { name: t(d.name), n: d.outs })).join('\n')
    : t('hint.var.outs.none');

  return (
    <div className="bg-secondary/90 backdrop-blur-sm rounded-lg gold-border p-3 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-heading font-bold text-primary">{t('hint.heading', { phase })}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      <div className="bg-card/30 rounded-lg overflow-hidden">
        <VariableItem
          label={t('hint.var.pot.label')}
          value={t('hint.var.pot.value', { n: game.pot })}
          explanation={t('hint.var.pot.exp', { n: game.pot })}
        />
        <VariableItem
          label={t('hint.var.tocall.label')}
          value={toCall === 0 ? t('hint.var.tocall.free') : t('hint.var.tocall.value', { n: toCall })}
          explanation={
            toCall === 0
              ? t('hint.var.tocall.exp.free', { bot: game.botBet, me: game.playerBet })
              : t('hint.var.tocall.exp.cost', { bot: game.botBet, me: game.playerBet, n: toCall })
          }
        />
        <VariableItem
          label={t('hint.var.potodds.label')}
          value={toCall === 0 ? t('hint.var.potodds.zero') : potOddsResult ? t('hint.var.potodds.value', { n: potOddsPct }) : '—'}
          explanation={
            toCall === 0
              ? t('hint.var.potodds.exp.free', { pot: game.pot })
              : potOddsResult
              ? t('hint.var.potodds.exp.cost', { n: toCall, pot: game.pot, odds: potOddsPct })
              : t('hint.var.potodds.exp.na')
          }
        />
        {outsResult && (
          <VariableItem
            label={t('hint.var.outs.label')}
            value={`${outsResult.totalOuts}`}
            explanation={t('hint.var.outs.exp', {
              remaining: outsResult.cardsRemaining,
              lines: outsExpLines,
              total: outsResult.totalOuts,
            })}
          />
        )}
        {potOddsResult && outsResult && (
          <VariableItem
            label={t('hint.var.improve.label')}
            value={
              game.communityCards.length === 3
                ? t('hint.var.improve.value.runout', { n: improvePct, runout: potOddsResult.outsOddsRunout.toFixed(1) })
                : t('hint.var.improve.value', { n: improvePct })
            }
            explanation={
              game.communityCards.length === 3
                ? t('hint.var.improve.exp.runout', {
                    outs: outsResult.totalOuts,
                    remaining: outsResult.cardsRemaining,
                    odds: improvePct,
                    ruleOf4: outsResult.totalOuts * 4,
                    runout: potOddsResult.outsOddsRunout.toFixed(1),
                  })
                : t('hint.var.improve.exp.next', {
                    outs: outsResult.totalOuts,
                    remaining: outsResult.cardsRemaining,
                    odds: improvePct,
                  })
            }
          />
        )}
        <VariableItem
          label={t('hint.var.equity.label')}
          value={t('hint.var.equity.value', { n: equityPct })}
          explanation={t('hint.var.equity.exp', { n: equityPct })}
        />
      </div>

      {/* Comparison table */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground text-center">{t('hint.compare.heading')}</p>
        <div className="overflow-x-auto rounded-lg border border-primary/20">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-card/60 border-b border-primary/15">
                <th className="py-1.5 px-2 text-right text-muted-foreground font-heading">{t('hint.compare.var')}</th>
                <th className={`py-1.5 px-2 text-center font-heading border-x border-primary/10 ${ratingColor(callAnalysis.rating)} bg-opacity-30`}>
                  {ratingIcon(callAnalysis.rating)} {toCall === 0 ? t('hint.compare.check') : t('hint.compare.call')}
                </th>
                <th className={`py-1.5 px-2 text-center font-heading border-l border-primary/10 ${ratingColor(raiseAnalysis.rating)} bg-opacity-30`}>
                  {ratingIcon(raiseAnalysis.rating)} {t('hint.compare.raise')}
                </th>
                <th className={`py-1.5 px-2 text-center font-heading border-l border-primary/10 ${ratingColor(foldAnalysis.rating)} bg-opacity-30`}>
                  {ratingIcon(foldAnalysis.rating)} {t('hint.compare.fold')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-primary/10">
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.cost')}</td>
                <td className="py-1 px-2 text-center border-x border-primary/10">{toCall === 0 ? '0 ✅' : toCall}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">{raiseCost}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">0</td>
              </tr>
              <tr className="border-b border-primary/10 bg-card/20">
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.pot.after')}</td>
                <td className="py-1 px-2 text-center border-x border-primary/10">{newPotCall}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">~{newPotRaise}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
              </tr>
              <tr className="border-b border-primary/10">
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.potodds')}</td>
                <td className="py-1 px-2 text-center border-x border-primary/10">{callPotOdds}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">{raisePotOdds}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
              </tr>
              <tr className="border-b border-primary/10 bg-card/20">
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.equity')}</td>
                <td className="py-1 px-2 text-center border-x border-primary/10">{equityPct}%</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">{equityPct}%</td>
                <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">0%</td>
              </tr>
              <tr className="border-b border-primary/10">
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.outs')}</td>
                <td className="py-1 px-2 text-center border-x border-primary/10">{outsCount}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">{outsCount}</td>
                <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
              </tr>
              <tr className="border-b border-primary/10 bg-card/20">
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.improve')}</td>
                <td className="py-1 px-2 text-center border-x border-primary/10">{improvePct}%</td>
                <td className="py-1 px-2 text-center border-l border-primary/10">{improvePct}%</td>
                <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-right text-primary font-bold">{t('hint.compare.risk')}</td>
                <td className={`py-1 px-2 text-center border-x border-primary/10 ${ratingColor(callAnalysis.rating)}`}>
                  {toCall === 0 ? t('hint.risk.zero') : callAnalysis.rating === 'good' ? t('hint.risk.low') : t('hint.risk.high')}
                </td>
                <td className={`py-1 px-2 text-center border-l border-primary/10 ${ratingColor(raiseAnalysis.rating)}`}>
                  {raiseAnalysis.rating === 'good' ? t('hint.risk.medium') : raiseAnalysis.rating === 'neutral' ? t('hint.risk.medium') : t('hint.risk.high')}
                </td>
                <td className={`py-1 px-2 text-center border-l border-primary/10 ${ratingColor(foldAnalysis.rating)}`}>
                  {t('hint.risk.zero')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-lg p-2 border ${ratingColor('good')}`}>
        <p className="text-[10px] font-heading font-bold mb-1">{t('hint.rec.heading')}</p>
        <p className="text-xs font-bold mb-1">{recommendation.action}</p>
        <p className="text-[10px] whitespace-pre-line opacity-90">{recommendation.reason}</p>
      </div>
    </div>
  );
};

export default HintPanel;
