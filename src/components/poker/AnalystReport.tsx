import {
  GameState,
  getPlayerHandEval,
  getBotHandEval,
  getActionHebrew,
  getPhaseHebrew,
  calculateEquity,
  calculateOuts,
  calculatePotOdds,
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

  // Calculate outs & pot odds per phase
  const getPhaseAnalysis = () => {
    const phases: { phase: string; community: typeof game.communityCards; pot: number; toCall: number }[] = [];
    
    // Reconstruct phases from actions
    let runningPot = 30; // initial blinds
    const communitySnapshots: { phase: string; cards: typeof game.communityCards }[] = [];
    
    if (game.communityCards.length >= 3) {
      communitySnapshots.push({ phase: 'פלופ', cards: game.communityCards.slice(0, 3) });
    }
    if (game.communityCards.length >= 4) {
      communitySnapshots.push({ phase: 'טרן', cards: game.communityCards.slice(0, 4) });
    }
    if (game.communityCards.length >= 5) {
      communitySnapshots.push({ phase: 'ריבר', cards: game.communityCards.slice(0, 5) });
    }
    
    return communitySnapshots;
  };

  const phaseSnapshots = getPhaseAnalysis();

  // Analyst recommendation based on equity
  const getRecommendation = (phase: string, equity: number): string => {
    if (equity > 0.65) return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, הפעולה הנכונה היא רייז. יד חזקה שצריך לבנות איתה פוט.`;
    if (equity > 0.45) return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, הפעולה הנכונה היא קול. יד סבירה ששווה לראות עוד קלפים.`;
    if (equity > 0.3) return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, אפשר לעשות צ'ק/קול אם המחיר נמוך, אבל להיזהר מהשקעה גדולה.`;
    return `בשלב ה${phase}, עם אקוויטי של ${(equity * 100).toFixed(0)}%, עדיף פולד. הסיכוי לזכות נמוך מדי ביחס לעלות.`;
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

      {/* Outs & Pot Odds per phase */}
      {phaseSnapshots.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-heading font-bold text-primary mb-2">🔢 אאוטס ופוט אודס — ניתוח לפי שלב</h3>
          <div className="space-y-3">
            {phaseSnapshots.map((snapshot, idx) => {
              const outsResult = calculateOuts(game.playerHand, snapshot.cards);
              const toCall = 20; // simplified: typical bet to call
              const potOddsResult = calculatePotOdds(
                game.pot,
                toCall,
                outsResult.totalOuts,
                outsResult.cardsRemaining,
                snapshot.cards.length
              );

              return (
                <div key={idx} className="border-t border-primary/20 pt-2 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-heading font-bold text-primary">{snapshot.phase}</span>
                    <div className="flex gap-1">
                      {snapshot.cards.map((c, ci) => (
                        <PlayingCard key={ci} card={c} small />
                      ))}
                    </div>
                  </div>
                  
                  {outsResult.draws.length > 0 ? (
                    <div className="space-y-1 mb-1.5">
                      {outsResult.draws.map((draw, di) => (
                        <div key={di} className="flex items-center justify-between">
                          <GlossaryText
                            text={draw.name}
                            className="text-[10px] text-foreground"
                          />
                          <span className="text-[10px] text-primary font-bold">{draw.outs} אאוטס</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between bg-card/50 rounded px-2 py-1">
                        <span className="text-[10px] text-muted-foreground">סה״כ אאוטס:</span>
                        <span className="text-[10px] text-primary font-bold">{outsResult.totalOuts}</span>
                      </div>
                      
                      {/* Pot odds bar */}
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-muted-foreground">סיכוי שיפור:</span>
                          <span className="text-[10px] text-primary font-bold">{potOddsResult.outsOdds.toFixed(1)}%</span>
                        </div>
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${potOddsResult.isCallProfitable ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(potOddsResult.outsOdds, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/70 mb-1">אין דרואו ברורים בשלב זה.</p>
                  )}
                  
                  <GlossaryText
                    text={potOddsResult.explanation}
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
        <h3 className="text-xs font-heading font-bold text-primary mb-1">📈 אקוויטי סופי</h3>
        <div className="flex items-center gap-2">
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
