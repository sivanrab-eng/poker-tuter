import {
  GameState,
  getPlayerHandEval,
  getBotHandEval,
  getActionHebrew,
  getPhaseHebrew,
  calculateEquity,
} from '@/lib/pokerEngine';
import GlossaryText from './GlossaryText';
import PlayingCard from './PlayingCard';

interface AnalystReportProps {
  game: GameState;
  onNewGame: () => void;
}

const AnalystReport = ({ game, onNewGame }: AnalystReportProps) => {
  const playerEval = getPlayerHandEval(game);
  const botEval = getBotHandEval(game);
  const playerEquity = calculateEquity(game.playerHand, game.communityCards);
  
  const playerActions = game.actions.filter(a => a.actor === 'player');
  const botActions = game.actions.filter(a => a.actor === 'bot');

  // Analyst recommendation based on equity
  const getRecommendation = (phase: string, equity: number): string => {
    if (equity > 0.65) return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, הפעולה הנכונה היא רייז. יד חזקה שצריך לבנות איתה פוט.`;
    if (equity > 0.45) return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, הפעולה הנכונה היא קול. יד סבירה ששווה לראות עוד קלפים.`;
    if (equity > 0.3) return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, אפשר לעשות צ'ק/קול אם המחיר נמוך, אבל להיזהר מהשקעה גדולה.`;
    return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, עדיף פולד. הסיכוי לזכות נמוך מדי ביחס לעלות.`;
  };

  // Combinatorial analysis
  const getCombAnalysis = (): string => {
    if (game.communityCards.length < 3) return 'לא מספיק קלפים קהילתיים לניתוח קומבינטורי.';
    
    const suits = game.communityCards.map(c => c.suit);
    const ranks = game.communityCards.map(c => c.rank);
    const suitCounts: Record<string, number> = {};
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    
    const parts: string[] = [];
    
    // Flush draw check
    const maxSuitCount = Math.max(...Object.values(suitCounts));
    if (maxSuitCount >= 3) {
      parts.push(`יש ${maxSuitCount} קלפים מאותו סמל על השולחן — אפשרות לפלאש. 9 אאוטס אפשריים.`);
    }
    
    // Straight possibilities
    const numericRanks = game.communityCards.map(c => {
      const map: Record<string, number> = {'A':14,'K':13,'Q':12,'J':11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2};
      return map[c.rank];
    }).sort((a,b) => a-b);
    
    const gaps = [];
    for (let i = 1; i < numericRanks.length; i++) {
      gaps.push(numericRanks[i] - numericRanks[i-1]);
    }
    if (gaps.some(g => g <= 2)) {
      parts.push('קלפים קרובים בערכם על השולחן — אפשרות לסטרייט.');
    }
    
    // Pair on board
    const rankCounts: Record<string, number> = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    if (Object.values(rankCounts).some(c => c >= 2)) {
      parts.push('יש זוג על השולחן — כל שחקן יכול לבנות פול האוס או שלישייה.');
    }
    
    if (parts.length === 0) {
      parts.push('השולחן מפוזר — אין דרואו ברורים. היתרון לשחקן עם הזוג הגבוה ביותר.');
    }
    
    return parts.join(' ');
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-right h-full overflow-y-auto">
      <h2 className="text-lg font-heading font-bold text-primary text-center">📊 דו״ח אנליסט</h2>
      
      {/* Result */}
      <div className="bg-secondary/50 rounded-lg p-3 gold-border">
        <h3 className="text-sm font-heading font-bold text-primary mb-1">
          {game.winner === 'player' ? '🏆 ניצחון!' : game.winner === 'bot' ? '😞 הפסד' : '🤝 תיקו'}
        </h3>
        <GlossaryText 
          text={`יד מנצחת: ${game.winningHandName}. פוט סופי: ${game.pot} צ'יפס.`}
          className="text-xs text-muted-foreground"
        />
      </div>

      {/* Cards review */}
      {(game.phase === 'showdown' || game.phase === 'finished') && game.winner !== 'player' && game.actions.some(a => a.action === 'fold' && a.actor === 'player') ? null : (
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-heading font-bold text-primary mb-2">הקלפים</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 text-center">שלך</p>
              <div className="flex gap-1 justify-center">
                {game.playerHand.map((c, i) => <PlayingCard key={i} card={c} small />)}
              </div>
              {playerEval && <p className="text-[10px] text-primary mt-1 text-center">{playerEval.name}</p>}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 text-center">בוט</p>
              <div className="flex gap-1 justify-center">
                {game.botHand.map((c, i) => <PlayingCard key={i} card={c} small />)}
              </div>
              {botEval && <p className="text-[10px] text-primary mt-1 text-center">{botEval.name}</p>}
            </div>
          </div>
        </div>
      )}

      {/* What I did */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-1">🎯 מה עשית</h3>
        <div className="space-y-1">
          {playerActions.map((a, i) => (
            <GlossaryText
              key={i}
              text={`${getPhaseHebrew(a.phase)}: ${getActionHebrew(a.action)}${a.amount ? ` (${a.amount})` : ''}`}
              className="text-xs text-foreground block"
            />
          ))}
        </div>
      </div>

      {/* What the analyst would do */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-1">🧠 מה האנליסט היה עושה</h3>
        <GlossaryText
          text={getRecommendation(getPhaseHebrew(game.phase === 'finished' ? 'preflop' : game.phase), playerEquity)}
          className="text-xs text-foreground"
        />
      </div>

      {/* Combinatorial analysis */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-1">🔢 ניתוח קומבינטורי</h3>
        <GlossaryText
          text={getCombAnalysis()}
          className="text-xs text-foreground"
        />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">אקוויטי שלך:</span>
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
        🃏 משחק חדש
      </button>
    </div>
  );
};

export default AnalystReport;
