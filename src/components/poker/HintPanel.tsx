import { useState } from 'react';
import { X } from 'lucide-react';
import {
  GameState,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
  getPhaseHebrew,
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

const HintPanel = ({ game, onClose }: HintPanelProps) => {
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

  // Build recommendation
  const getRecommendation = (): { action: string; reason: string } => {
    if (toCall === 0) {
      return {
        action: 'צ׳ק / רייז',
        reason: `אין עלות להמשיך (צ׳ק חינמי). תמיד נכון לראות עוד קלפים בחינם.\n\nאם יש לך יד חזקה (אקוויטי ${(equity * 100).toFixed(0)}%), שקול רייז כדי לבנות פוט.`,
      };
    }
    if (potOddsResult?.isCallProfitable) {
      return {
        action: 'קול ✅',
        reason: `סיכוי השיפור שלך (${potOddsResult.outsOdds.toFixed(1)}%) גבוה מפוט אודס (${potOddsResult.potOdds.toFixed(1)}%).\nזה אומר שסטטיסטית, לאורך זמן, הקול ירוויח כסף.`,
      };
    }
    if (equity > 0.55) {
      return {
        action: 'רייז',
        reason: `אקוויטי גבוה של ${(equity * 100).toFixed(0)}% — יד חזקה.\nכדאי לבנות פוט ולגרום ליריב לשלם.`,
      };
    }
    if (potOddsResult && !potOddsResult.isCallProfitable) {
      return {
        action: 'פולד ❌',
        reason: `סיכוי השיפור (${potOddsResult.outsOdds.toFixed(1)}%) נמוך מפוט אודס (${potOddsResult.potOdds.toFixed(1)}%).\nלאורך זמן, קול כאן יפסיד כסף.`,
      };
    }
    if (equity < 0.3) {
      return {
        action: 'פולד',
        reason: `אקוויטי נמוך (${(equity * 100).toFixed(0)}%) — סיכוי נמוך לנצח.\nעדיף לחסוך צ׳יפס למשחקים עם יד טובה יותר.`,
      };
    }
    return {
      action: 'קול',
      reason: `אקוויטי סביר (${(equity * 100).toFixed(0)}%). שווה לראות עוד קלפים אם המחיר סביר.`,
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-secondary/90 backdrop-blur-sm rounded-lg gold-border p-3 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-heading font-bold text-primary">💡 רמז — {phase}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      <div className="bg-card/30 rounded-lg overflow-hidden">
        {/* Pot */}
        <VariableItem
          label="פוט (Pot)"
          value={`${game.pot} צ׳יפס`}
          explanation={`הפוט הוא סך כל הצ׳יפס שהושקעו ביד הנוכחית.\n\n📐 חישוב: סכום כל ההימורים מכל השלבים = ${game.pot} צ׳יפס.\n\nככל שהפוט גדול יותר, כך משתלם יותר לנסות לזכות בו.`}
        />

        {/* toCall */}
        <VariableItem
          label="עלות קול (To Call)"
          value={toCall === 0 ? 'חינמי ✅' : `${toCall} צ׳יפס`}
          explanation={
            toCall === 0
              ? `אין הימור לשלם — אתה יכול לעשות צ׳ק (לבדוק) בחינם.\n\n📐 חישוב: הימור הבוט (${game.botBet}) − ההימור שלך (${game.playerBet}) = 0.\n\nתמיד נכון להמשיך כשאין עלות!`
              : `כמה צ׳יפס אתה צריך לשלם כדי להישאר ביד.\n\n📐 חישוב: הימור הבוט (${game.botBet}) − ההימור שלך (${game.playerBet}) = ${toCall} צ׳יפס.\n\nזה הסכום שצריך לבדוק אם "שווה" לשלם.`
          }
        />

        {/* Pot Odds */}
        <VariableItem
          label="פוט אודס (Pot Odds)"
          value={
            toCall === 0
              ? '0% (חינמי)'
              : potOddsResult
              ? `${potOddsResult.potOdds.toFixed(1)}%`
              : '—'
          }
          explanation={
            toCall === 0
              ? `פוט אודס = עלות הקול / (הפוט + עלות הקול)\n\n📐 חישוב: 0 / (${game.pot} + 0) = 0%\n\nכשהפוט אודס הם 0%, כל סיכוי שיפור (אפילו 1%) הופך את ההמשך לרווחי.`
              : potOddsResult
              ? `פוט אודס = עלות הקול / (הפוט + עלות הקול)\n\n📐 חישוב: ${toCall} / (${game.pot} + ${toCall}) = ${potOddsResult.potOdds.toFixed(1)}%\n\nאם סיכוי השיפור שלך גבוה מ-${potOddsResult.potOdds.toFixed(1)}%, הקול רווחי.`
              : 'פוט אודס מחושבים מהפלופ ואילך.'
          }
        />

        {/* Outs */}
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

        {/* Improvement % */}
        {potOddsResult && outsResult && (
          <VariableItem
            label="סיכוי שיפור (%)"
            value={`${potOddsResult.outsOdds.toFixed(1)}%${game.communityCards.length === 3 ? ` (${potOddsResult.outsOddsRunout.toFixed(1)}% עד ריבר)` : ''}`}
            explanation={`סיכוי שיפור = אאוטס / קלפים שנותרו\n\n📐 חישוב (קלף הבא): ${outsResult.totalOuts} / ${outsResult.cardsRemaining} = ${potOddsResult.outsOdds.toFixed(1)}%${
              game.communityCards.length === 3
                ? `\n\n📐 חישוב (עד ריבר — כלל ה-4×): ${outsResult.totalOuts} × 4 ≈ ${outsResult.totalOuts * 4}% (מדויק: ${potOddsResult.outsOddsRunout.toFixed(1)}%)`
                : ''
            }\n\nככל שיש יותר אאוטס, הסיכוי לשפר יד גדל.`}
          />
        )}

        {/* Equity */}
        <VariableItem
          label="אקוויטי (Equity)"
          value={`${(equity * 100).toFixed(0)}%`}
          explanation={`אקוויטי = הסיכוי הכולל שלך לזכות ביד.\n\n📐 ערך נוכחי: ${(equity * 100).toFixed(0)}%\n\nזה כולל גם את הסיכוי שהיד שלך כבר מנצחת עכשיו וגם את הסיכוי לשפר.\n\n• מעל 65% → רייז (בנה פוט)\n• 45-65% → קול (יד סבירה)\n• מתחת ל-30% → שקול פולד`}
        />
      </div>

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
