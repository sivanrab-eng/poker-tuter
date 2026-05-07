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

  // Calculate outs & pot odds per phase with real pot/bet values
  const getPhaseAnalysis = () => {
    const phaseNames = ['flop', 'turn', 'river'];
    const phaseHebrewMap: Record<string, string> = { flop: 'פלופ', turn: 'טרן', river: 'ריבר' };
    const communityByPhase: Record<string, typeof game.communityCards> = {
      flop: game.communityCards.slice(0, 3),
      turn: game.communityCards.slice(0, 4),
      river: game.communityCards.slice(0, 5),
    };

    // Reconstruct pot at start of each phase & the toCall the player faced
    let runningPot = 30; // blinds
    const results: { phase: string; cards: typeof game.communityCards; pot: number; toCall: number }[] = [];

    for (const phaseName of phaseNames) {
      if (phaseName === 'flop' && game.communityCards.length < 3) break;
      if (phaseName === 'turn' && game.communityCards.length < 4) break;
      if (phaseName === 'river' && game.communityCards.length < 5) break;

      // Sum actions from previous phases into runningPot
      // (preflop actions before flop, flop actions before turn, etc.)
      const prevPhases = phaseName === 'flop' ? ['preflop'] : phaseName === 'turn' ? ['preflop', 'flop'] : ['preflop', 'flop', 'turn'];
      
      // Only add amounts from phases we haven't added yet
      const alreadyCounted = results.length > 0 
        ? (phaseName === 'turn' ? ['flop'] : phaseName === 'river' ? ['turn'] : [])
        : prevPhases;
      
      for (const a of game.actions) {
        if (alreadyCounted.includes(a.phase) && a.amount) {
          runningPot += a.amount;
        }
      }

      // Find the toCall the player faced in this phase
      const phaseActions = game.actions.filter(a => a.phase === phaseName);
      let toCall = 0;
      // Look for bot bets/raises before the player's action in this phase
      let playerBet = 0;
      let botBet = 0;
      for (const a of phaseActions) {
        if (a.actor === 'bot' && a.amount) botBet += a.amount;
        if (a.actor === 'player' && a.amount) playerBet += a.amount;
      }
      toCall = Math.max(0, botBet - playerBet);
      // If player acted first (call/raise), use that amount
      if (toCall === 0) {
        const playerAction = phaseActions.find(a => a.actor === 'player' && a.action === 'call');
        if (playerAction?.amount) toCall = playerAction.amount;
      }

      results.push({
        phase: phaseHebrewMap[phaseName],
        cards: communityByPhase[phaseName],
        pot: runningPot,
        toCall,
      });
    }

    return results;
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

      {/* Chronological action timeline */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h3 className="text-xs font-heading font-bold text-primary mb-2">📜 רצף היד</h3>
        <div className="space-y-0.5">
          {(() => {
            let runPot = 30; // blinds
            const phases = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const;
            const rows: React.ReactNode[] = [];
            let prevPhase = '';

            for (const a of game.actions) {
              // Phase divider
              if (a.phase !== prevPhase) {
                if (prevPhase !== '') {
                  rows.push(<div key={`div-${a.phase}`} className="border-t border-primary/10 my-1" />);
                }
                rows.push(
                  <p key={`hdr-${a.phase}`} className="text-[10px] font-heading font-bold text-primary/70 mb-0.5">
                    {getPhaseHebrew(a.phase)}
                  </p>
                );
                prevPhase = a.phase;
              }

              if (a.amount) runPot += a.amount;

              const isPlayer = a.actor === 'player';
              const icon = isPlayer ? '🃏' : '🤖';
              const label = isPlayer ? 'אתה' : 'בוט';

              rows.push(
                <div
                  key={rows.length}
                  className={`flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded ${isPlayer ? 'bg-primary/5' : 'bg-secondary/50'}`}
                >
                  <span className="text-foreground">
                    {icon} <span className="font-bold">{label}</span>:{' '}
                    <GlossaryText text={getActionHebrew(a.action)} className="inline" />
                    {a.amount ? ` (${a.amount})` : ''}
                  </span>
                  <span className="text-[10px] text-muted-foreground">פוט {runPot}</span>
                </div>
              );
            }

            return rows;
          })()}
        </div>
        {/* Winning phase */}
        <div className="mt-2 pt-2 border-t border-primary/20">
          <p className="text-[10px] text-muted-foreground">
            🏁 היד הוכרעה בשלב: <span className="text-primary font-bold">{getPhaseHebrew(
              game.actions.length > 0 ? game.actions[game.actions.length - 1].phase : game.phase
            )}</span>
            {game.winner === 'player' && game.actions[game.actions.length - 1]?.action === 'fold' && (
              <span className="text-green-400"> — הבוט פילד!</span>
            )}
            {game.winner === 'bot' && game.actions[game.actions.length - 1]?.action === 'fold' && (
              <span className="text-red-400"> — פילדת</span>
            )}
          </p>
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
                    <span className="text-[11px] font-heading font-bold text-primary">{snapshot.phase}</span>
                    <div className="flex gap-1">
                      {snapshot.cards.map((c, ci) => (
                        <PlayingCard key={ci} card={c} small />
                      ))}
                    </div>
                  </div>

                  {/* Calculation details table */}
                  <div className="bg-card/30 rounded p-2 mb-1.5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">פוט:</span>
                      <span className="text-[10px] text-primary font-bold">{snapshot.pot}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">עלות קול:</span>
                      <span className="text-[10px] text-primary font-bold">{snapshot.toCall}</span>
                    </div>
                    {snapshot.toCall > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">פוט אודס (עלות/פוט+עלות):</span>
                        <span className="text-[10px] text-primary font-bold">{potOddsResult.potOdds.toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">פוט אודס:</span>
                        <span className="text-[10px] text-green-400 font-bold">צ׳ק חינמי ✅</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">קלפים שנותרו בחפיסה:</span>
                      <span className="text-[10px] text-primary font-bold">{outsResult.cardsRemaining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">סה״כ אאוטס:</span>
                      <span className="text-[10px] text-primary font-bold">{outsResult.totalOuts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">סיכוי שיפור (קלף הבא):</span>
                      <span className="text-[10px] text-primary font-bold">{potOddsResult.outsOdds.toFixed(1)}%</span>
                    </div>
                    {snapshot.cards.length === 3 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">סיכוי שיפור (עד ריבר):</span>
                        <span className="text-[10px] text-primary font-bold">{potOddsResult.outsOddsRunout.toFixed(1)}%</span>
                      </div>
                    )}
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
                      
                      {/* Pot odds bar */}
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {snapshot.cards.length === 3 ? 'שיפור עד ריבר:' : 'שיפור:'}
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

                      {/* Decision */}
                      {snapshot.toCall === 0 ? (
                        <div className="mt-1 px-2 py-1.5 rounded bg-green-500/20 text-green-400 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold">
                            <span>✅</span>
                            <span>צ׳ק חינמי — תמיד נכון להמשיך</span>
                          </div>
                          <div className="text-[9px] text-green-300/80 leading-relaxed space-y-0.5">
                            <p>📐 <strong>חישוב:</strong> Pot = {snapshot.pot}, toCall = 0</p>
                            <p>→ Pot Odds = toCall / (Pot + toCall) = 0 / ({snapshot.pot}+0) = <strong>0%</strong></p>
                            <p>→ אאוטס: {outsResult.totalOuts} מתוך {outsResult.cardsRemaining} קלפים</p>
                            <p>→ סיכוי שיפור (קלף הבא): {outsResult.totalOuts}/{outsResult.cardsRemaining} = <strong>{potOddsResult.outsOdds.toFixed(1)}%</strong></p>
                            {snapshot.cards.length === 3 && (
                              <p>→ סיכוי שיפור (עד ריבר): ≈ <strong>{potOddsResult.outsOddsRunout.toFixed(1)}%</strong></p>
                            )}
                            <p>→ כל אחוז שיפור &gt; 0% = <strong>קול/צ׳ק תמיד רווחי</strong></p>
                          </div>
                          <div className="mt-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[9px] text-green-300/90 leading-relaxed space-y-0.5">
                            <p>📊 <strong>דוגמה עם המספרים שלך:</strong></p>
                            <p>הפוט עומד על <strong>{snapshot.pot}</strong> צ׳יפס ואתה לא צריך לשלם כלום (toCall=0).</p>
                            <p>יש לך <strong>{outsResult.totalOuts}</strong> אאוטס מתוך <strong>{outsResult.cardsRemaining}</strong> קלפים שנותרו בחפיסה.</p>
                            {outsResult.totalOuts > 0 ? (
                              <>
                                <p>סיכוי לשפר יד בקלף הבא: {outsResult.totalOuts}÷{outsResult.cardsRemaining} = <strong>{potOddsResult.outsOdds.toFixed(1)}%</strong>.</p>
                                {snapshot.cards.length === 3 && (
                                  <p>סיכוי לשפר עד הריבר (2 קלפים): ≈ <strong>{potOddsResult.outsOddsRunout.toFixed(1)}%</strong> (כלל ה-4×אאוטס ≈ {outsResult.totalOuts * 4}%).</p>
                                )}
                                <p>כיוון ש-Pot Odds = 0% ואילו סיכוי השיפור = {potOddsResult.outsOdds.toFixed(1)}%, <strong>תמיד משתלם להמשיך</strong>.</p>
                              </>
                            ) : (
                              <p>אין אאוטס לשיפור, אבל מכיוון שאין עלות — <strong>עדיף לצ׳ק ולראות קלפים בחינם</strong>.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1 mt-1 px-2 py-1 rounded text-[10px] font-bold ${potOddsResult.isCallProfitable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          <span>{potOddsResult.isCallProfitable ? '✅' : '❌'}</span>
                          <span>{potOddsResult.isCallProfitable ? 'קול רווחי' : 'קול לא רווחי'}</span>
                        </div>
                      )}
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
