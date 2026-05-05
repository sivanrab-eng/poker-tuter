import { useState } from 'react';
import { X } from 'lucide-react';
import {
  GameState,
  Action,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
  getPhaseHebrew,
  getActionHebrew,
} from '@/lib/pokerEngine';

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
  const [selectedAction, setSelectedAction] = useState<SimAction | null>(null);

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

  const phase = getPhaseHebrew(game.phase);
  const equityPct = (equity * 100).toFixed(0);
  const improvePct = potOddsResult?.outsOdds.toFixed(1) ?? '—';
  const potOddsPct = potOddsResult?.potOdds.toFixed(1) ?? '—';
  const outsCount = outsResult?.totalOuts ?? 0;
  const raiseSize = Math.max(toCall * 2, Math.round(game.pot * 0.6));

  // Simulation for each action
  const getActionAnalysis = (action: SimAction): { rating: 'good' | 'neutral' | 'bad'; title: string; lines: string[] } => {
    if (action === 'fold') {
      const invested = game.playerBet;
      const lines = [
        `📐 ניתוח פולד:`,
        `• אתה מוותר על הפוט (${game.pot} צ׳יפס).`,
        `• הפסד מצטבר ביד: ${invested} צ׳יפס שכבר השקעת.`,
        `• אקוויטי נוכחי: ${equityPct}% — ${Number(equityPct) > 40 ? 'גבוה מדי לוותר!' : 'נמוך, ויתור סביר.'}`,
      ];
      if (potOddsResult) {
        lines.push(`• פוט אודס: ${potOddsPct}% | סיכוי שיפור: ${improvePct}%`);
        if (potOddsResult.isCallProfitable) {
          lines.push(`\n❌ הקול רווחי כאן — פולד מבזבז הזדמנות!`);
        } else {
          lines.push(`\n✅ הקול לא רווחי — פולד חוסך ${toCall} צ׳יפס.`);
        }
      } else {
        lines.push(Number(equityPct) < 30
          ? `\n✅ יד חלשה — פולד חוסך כסף לטווח ארוך.`
          : `\n⚠️ שקול צ׳ק/קול לפני שמוותר — יד לא חלשה.`
        );
      }
      const rating = (potOddsResult?.isCallProfitable || Number(equityPct) > 50) ? 'bad' : Number(equityPct) < 30 ? 'good' : 'neutral';
      return { rating, title: 'פולד — ניתוח', lines };
    }

    if (action === 'call') {
      const newPot = game.pot + toCall;
      const lines = [
        `📐 ניתוח קול (${toCall === 0 ? 'צ׳ק חינמי' : `עלות: ${toCall}`}):`,
        `• פוט אחרי קול: ${game.pot} + ${toCall} = ${newPot} צ׳יפס`,
      ];
      if (toCall === 0) {
        lines.push(`• עלות: 0 — אין סיכון!`);
        lines.push(`• אקוויטי: ${equityPct}%`);
        lines.push(`\n✅ צ׳ק חינמי — תמיד נכון להמשיך.`);
        if (outsCount > 0) {
          lines.push(`   ${outsCount} אאוטס (${improvePct}% לשפר) ללא עלות.`);
        }
        return { rating: 'good', title: 'קול / צ׳ק — ניתוח', lines };
      }
      lines.push(`• פוט אודס: ${toCall} / ${newPot} = ${potOddsPct}%`);
      lines.push(`• אאוטס: ${outsCount} | סיכוי שיפור: ${improvePct}%`);
      lines.push(`• אקוויטי: ${equityPct}%`);
      if (potOddsResult?.isCallProfitable) {
        lines.push(`\n✅ קול רווחי! סיכוי שיפור (${improvePct}%) > פוט אודס (${potOddsPct}%).`);
        lines.push(`   לאורך 100 ידיים כאלה, תרוויח בממוצע.`);
      } else {
        lines.push(`\n❌ קול לא רווחי: סיכוי שיפור (${improvePct}%) < פוט אודס (${potOddsPct}%).`);
        lines.push(`   לאורך 100 ידיים כאלה, תפסיד בממוצע.`);
      }
      const rating = potOddsResult?.isCallProfitable ? 'good' : 'bad';
      return { rating, title: 'קול — ניתוח', lines };
    }

    // raise
    const newPot = game.pot + toCall + raiseSize;
    const lines = [
      `📐 ניתוח רייז (${raiseSize} צ׳יפס):`,
      `• עלות: ${toCall} (קול) + ${raiseSize} (העלאה) = ${toCall + raiseSize} צ׳יפס`,
      `• פוט אחרי רייז: ~${newPot} צ׳יפס`,
      `• אקוויטי: ${equityPct}%`,
    ];
    if (outsCount > 0) {
      lines.push(`• אאוטס: ${outsCount} | שיפור: ${improvePct}%`);
    }
    if (Number(equityPct) > 55) {
      lines.push(`\n✅ רייז חזק! אקוויטי גבוה (${equityPct}%) — בנה פוט.`);
      lines.push(`   לחץ על היריב ותגרום לו לטעויות.`);
    } else if (Number(equityPct) > 40) {
      lines.push(`\n⚠️ רייז כ-בלאף (סמי-בלאף): אקוויטי ${equityPct}%.`);
      lines.push(`   יכול לעבוד אם היריב יפלד, אבל מסוכן.`);
    } else {
      lines.push(`\n❌ רייז מסוכן! אקוויטי נמוך (${equityPct}%).`);
      lines.push(`   אתה משקיע ${toCall + raiseSize} צ׳יפס עם סיכוי נמוך לזכות.`);
    }
    const rating = Number(equityPct) > 55 ? 'good' : Number(equityPct) > 40 ? 'neutral' : 'bad';
    return { rating, title: 'רייז — ניתוח', lines };
  };

  const analysis = selectedAction ? getActionAnalysis(selectedAction) : null;

  // Build recommendation
  const getRecommendation = (): { action: string; reason: string } => {
    if (toCall === 0) {
      return {
        action: 'צ׳ק / רייז',
        reason: `אין עלות להמשיך (צ׳ק חינמי). תמיד נכון לראות עוד קלפים בחינם.\n\nאם יש לך יד חזקה (אקוויטי ${equityPct}%), שקול רייז כדי לבנות פוט.`,
      };
    }
    if (potOddsResult?.isCallProfitable) {
      return {
        action: 'קול ✅',
        reason: `סיכוי השיפור שלך (${improvePct}%) גבוה מפוט אודס (${potOddsPct}%).\nזה אומר שסטטיסטית, לאורך זמן, הקול ירוויח כסף.`,
      };
    }
    if (equity > 0.55) {
      return {
        action: 'רייז',
        reason: `אקוויטי גבוה של ${equityPct}% — יד חזקה.\nכדאי לבנות פוט ולגרום ליריב לשלם.`,
      };
    }
    if (potOddsResult && !potOddsResult.isCallProfitable) {
      return {
        action: 'פולד ❌',
        reason: `סיכוי השיפור (${improvePct}%) נמוך מפוט אודס (${potOddsPct}%).\nלאורך זמן, קול כאן יפסיד כסף.`,
      };
    }
    if (equity < 0.3) {
      return {
        action: 'פולד',
        reason: `אקוויטי נמוך (${equityPct}%) — סיכוי נמוך לנצח.\nעדיף לחסוך צ׳יפס למשחקים עם יד טובה יותר.`,
      };
    }
    return {
      action: 'קול',
      reason: `אקוויטי סביר (${equityPct}%). שווה לראות עוד קלפים אם המחיר סביר.`,
    };
  };

  const recommendation = getRecommendation();

  const ratingColor = (r: 'good' | 'neutral' | 'bad') =>
    r === 'good' ? 'bg-green-500/15 border-green-500/30 text-green-400' :
    r === 'bad' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
    'bg-yellow-500/15 border-yellow-500/30 text-yellow-400';

  const ratingIcon = (r: 'good' | 'neutral' | 'bad') =>
    r === 'good' ? '✅' : r === 'bad' ? '❌' : '⚠️';

  return (
    <div className="bg-secondary/90 backdrop-blur-sm rounded-lg gold-border p-3 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-heading font-bold text-primary">💡 רמז — {phase}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      <div className="bg-card/30 rounded-lg overflow-hidden">
        <VariableItem
          label="פוט (Pot)"
          value={`${game.pot} צ׳יפס`}
          explanation={`הפוט הוא סך כל הצ׳יפס שהושקעו ביד הנוכחית.\n\n📐 חישוב: סכום כל ההימורים מכל השלבים = ${game.pot} צ׳יפס.\n\nככל שהפוט גדול יותר, כך משתלם יותר לנסות לזכות בו.`}
        />
        <VariableItem
          label="עלות קול (To Call)"
          value={toCall === 0 ? 'חינמי ✅' : `${toCall} צ׳יפס`}
          explanation={
            toCall === 0
              ? `אין הימור לשלם — אתה יכול לעשות צ׳ק בחינם.\n\n📐 חישוב: הימור הבוט (${game.botBet}) − ההימור שלך (${game.playerBet}) = 0.\n\nתמיד נכון להמשיך כשאין עלות!`
              : `כמה צ׳יפס אתה צריך לשלם כדי להישאר ביד.\n\n📐 חישוב: הימור הבוט (${game.botBet}) − ההימור שלך (${game.playerBet}) = ${toCall} צ׳יפס.\n\nזה הסכום שצריך לבדוק אם "שווה" לשלם.`
          }
        />
        <VariableItem
          label="פוט אודס (Pot Odds)"
          value={toCall === 0 ? '0% (חינמי)' : potOddsResult ? `${potOddsPct}%` : '—'}
          explanation={
            toCall === 0
              ? `פוט אודס = עלות הקול / (הפוט + עלות הקול)\n\n📐 חישוב: 0 / (${game.pot} + 0) = 0%\n\nכשהפוט אודס הם 0%, כל סיכוי שיפור הופך את ההמשך לרווחי.`
              : potOddsResult
              ? `פוט אודס = עלות הקול / (הפוט + עלות הקול)\n\n📐 חישוב: ${toCall} / (${game.pot} + ${toCall}) = ${potOddsPct}%\n\nאם סיכוי השיפור שלך גבוה מ-${potOddsPct}%, הקול רווחי.`
              : 'פוט אודס מחושבים מהפלופ ואילך.'
          }
        />
        {outsResult && (
          <VariableItem
            label="אאוטס (Outs)"
            value={`${outsResult.totalOuts}`}
            explanation={`אאוטס = קלפים בחפיסה שישפרו את היד שלך.\n\n📐 נותרו ${outsResult.cardsRemaining} קלפים בחפיסה.\n${outsResult.draws.length > 0
              ? outsResult.draws.map(d => `• ${d.name}: ${d.outs} אאוטס`).join('\n')
              : '• אין דרואו ספציפיים'
            }\n\nסה״כ: ${outsResult.totalOuts} אאוטס מתוך ${outsResult.cardsRemaining} קלפים.`}
          />
        )}
        {potOddsResult && outsResult && (
          <VariableItem
            label="סיכוי שיפור (%)"
            value={`${improvePct}%${game.communityCards.length === 3 ? ` (${potOddsResult.outsOddsRunout.toFixed(1)}% עד ריבר)` : ''}`}
            explanation={`סיכוי שיפור = אאוטס / קלפים שנותרו\n\n📐 חישוב (קלף הבא): ${outsResult.totalOuts} / ${outsResult.cardsRemaining} = ${improvePct}%${
              game.communityCards.length === 3
                ? `\n\n📐 חישוב (עד ריבר — כלל ה-4×): ${outsResult.totalOuts} × 4 ≈ ${outsResult.totalOuts * 4}% (מדויק: ${potOddsResult.outsOddsRunout.toFixed(1)}%)`
                : ''
            }\n\nככל שיש יותר אאוטס, הסיכוי לשפר יד גדל.`}
          />
        )}
        <VariableItem
          label="אקוויטי (Equity)"
          value={`${equityPct}%`}
          explanation={`אקוויטי = הסיכוי הכולל שלך לזכות ביד.\n\n📐 ערך נוכחי: ${equityPct}%\n\nזה כולל גם את הסיכוי שהיד שלך כבר מנצחת עכשיו וגם את הסיכוי לשפר.\n\n• מעל 65% → רייז (בנה פוט)\n• 45-65% → קול (יד סבירה)\n• מתחת ל-30% → שקול פולד`}
        />
      </div>

      {/* Comparison table */}
      {(() => {
        const callAnalysis = getActionAnalysis('call');
        const raiseAnalysis = getActionAnalysis('raise');
        const foldAnalysis = getActionAnalysis('fold');

        const newPotCall = game.pot + toCall;
        const raiseCost = toCall + raiseSize;
        const newPotRaise = game.pot + raiseCost;

        const callPotOdds = toCall === 0 ? '0%' : `${potOddsPct}%`;
        const raisePotOdds = `${(raiseCost / (newPotRaise + raiseCost) * 100).toFixed(1)}%`;

        return (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground text-center">📊 השוואת פעולות</p>
            <div className="overflow-x-auto rounded-lg border border-primary/20">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-card/60 border-b border-primary/15">
                    <th className="py-1.5 px-2 text-right text-muted-foreground font-heading">משתנה</th>
                    <th className={`py-1.5 px-2 text-center font-heading border-x border-primary/10 ${ratingColor(callAnalysis.rating)} bg-opacity-30`}>
                      {ratingIcon(callAnalysis.rating)} {toCall === 0 ? 'צ׳ק' : 'קול'}
                    </th>
                    <th className={`py-1.5 px-2 text-center font-heading border-l border-primary/10 ${ratingColor(raiseAnalysis.rating)} bg-opacity-30`}>
                      {ratingIcon(raiseAnalysis.rating)} רייז
                    </th>
                    <th className={`py-1.5 px-2 text-center font-heading border-l border-primary/10 ${ratingColor(foldAnalysis.rating)} bg-opacity-30`}>
                      {ratingIcon(foldAnalysis.rating)} פולד
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-primary/10">
                    <td className="py-1 px-2 text-right text-primary font-bold">💰 עלות</td>
                    <td className="py-1 px-2 text-center border-x border-primary/10">{toCall === 0 ? '0 ✅' : toCall}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">{raiseCost}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">0</td>
                  </tr>
                  <tr className="border-b border-primary/10 bg-card/20">
                    <td className="py-1 px-2 text-right text-primary font-bold">🏦 פוט אחרי</td>
                    <td className="py-1 px-2 text-center border-x border-primary/10">{newPotCall}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">~{newPotRaise}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
                  </tr>
                  <tr className="border-b border-primary/10">
                    <td className="py-1 px-2 text-right text-primary font-bold">📐 Pot Odds</td>
                    <td className="py-1 px-2 text-center border-x border-primary/10">{callPotOdds}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">{raisePotOdds}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
                  </tr>
                  <tr className="border-b border-primary/10 bg-card/20">
                    <td className="py-1 px-2 text-right text-primary font-bold">📈 Equity</td>
                    <td className="py-1 px-2 text-center border-x border-primary/10">{equityPct}%</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">{equityPct}%</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">0%</td>
                  </tr>
                  <tr className="border-b border-primary/10">
                    <td className="py-1 px-2 text-right text-primary font-bold">🎯 אאוטס</td>
                    <td className="py-1 px-2 text-center border-x border-primary/10">{outsCount}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">{outsCount}</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
                  </tr>
                  <tr className="border-b border-primary/10 bg-card/20">
                    <td className="py-1 px-2 text-right text-primary font-bold">📊 שיפור %</td>
                    <td className="py-1 px-2 text-center border-x border-primary/10">{improvePct}%</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10">{improvePct}%</td>
                    <td className="py-1 px-2 text-center border-l border-primary/10 text-muted-foreground">—</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 text-right text-primary font-bold">⚠️ סיכון</td>
                    <td className={`py-1 px-2 text-center border-x border-primary/10 font-bold ${toCall === 0 ? 'text-green-400' : toCall <= game.pot * 0.3 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {toCall === 0 ? 'אפס' : toCall <= game.pot * 0.3 ? 'נמוך' : 'בינוני'}
                    </td>
                    <td className={`py-1 px-2 text-center border-l border-primary/10 font-bold ${Number(equityPct) > 55 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {Number(equityPct) > 55 ? 'בינוני' : 'גבוה'}
                    </td>
                    <td className="py-1 px-2 text-center border-l border-primary/10 font-bold text-green-400">
                      אפס
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expandable details per action */}
            <div className="flex gap-1.5">
              {(['call', 'raise', 'fold'] as SimAction[]).map((act) => {
                const a = act === 'call' ? callAnalysis : act === 'raise' ? raiseAnalysis : foldAnalysis;
                return (
                  <button
                    key={act}
                    onClick={() => setSelectedAction(selectedAction === act ? null : act)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-heading font-bold transition-all border ${
                      selectedAction === act
                        ? ratingColor(a.rating)
                        : 'bg-card/40 text-foreground/70 border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    {act === 'call' ? (toCall === 0 ? 'פירוט צ׳ק' : 'פירוט קול') : act === 'raise' ? 'פירוט רייז' : 'פירוט פולד'}
                  </button>
                );
              })}
            </div>

            {analysis && (
              <div className={`rounded-lg border p-2.5 space-y-1 animate-in fade-in duration-200 ${ratingColor(analysis.rating)}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{ratingIcon(analysis.rating)}</span>
                  <span className="text-xs font-heading font-bold">{analysis.title}</span>
                </div>
                <div className="text-[10px] leading-relaxed whitespace-pre-line opacity-90">
                  {analysis.lines.join('\n')}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Final recommendation */}
      <div className={`rounded-lg p-2 ${
        recommendation.action.includes('פולד') ? 'bg-red-500/15 border border-red-500/30' :
        recommendation.action.includes('רייז') ? 'bg-primary/15 border border-primary/30' :
        'bg-green-500/15 border border-green-500/30'
      }`}>
        <VariableItem
          label="המלצת פעולה"
          value={recommendation.action}
          explanation={recommendation.reason}
        />
      </div>
    </div>
  );
};

export default HintPanel;
