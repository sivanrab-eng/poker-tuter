import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Calculator, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayingCard from "@/components/poker/PlayingCard";
import CoachBubble from "@/components/lessons/CoachBubble";
import { useI18n } from "@/lib/i18n";
import type { Card, Rank, Suit } from "@/lib/pokerEngine";

const RANKS: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS: Suit[] = ["♠","♥","♦","♣"];

function shuffleDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}

function rankValue(r: Rank): number {
  const m: Record<Rank,number> = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
  return m[r];
}

interface Scenario {
  hand: Card[]; community: Card[]; drawNameKey: string; outs: number; rule42: number;
  potSize: number; betSize: number; potOdds: number; isCallProfitable: boolean; explanationEn: string; explanationHe: string;
}

function generateFlushDraw(): Scenario {
  const deck = shuffleDeck(); const suit = SUITS[Math.floor(Math.random() * 4)];
  const suitCards = deck.filter(c => c.suit === suit); const otherCards = deck.filter(c => c.suit !== suit);
  const hand: Card[] = [suitCards[0], suitCards[1]]; const community: Card[] = [suitCards[2], suitCards[3], otherCards[0]];
  const outs = 9; const rule42 = outs * 4;
  const potSize = 60 + Math.floor(Math.random() * 5) * 20; const betSize = 20 + Math.floor(Math.random() * 4) * 10;
  const potOdds = Math.round((betSize / (potSize + betSize)) * 100);
  return { hand, community, drawNameKey: "scenario.flush", outs, rule42, potSize, betSize, potOdds, isCallProfitable: rule42 >= potOdds,
    explanationHe: `יש 13 קלפי ${suit} בחפיסה. 4 כבר גלויים → 9 אאוטס. כלל ה-4: 9×4 = 36%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "קול רווחי! ✅" : "קול לא רווחי ❌"}`,
    explanationEn: `There are 13 ${suit} cards in the deck. 4 are visible → 9 outs. Rule of 4: 9×4 = 36%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "Profitable call! ✅" : "Unprofitable call ❌"}`,
  };
}

function generateOESD(): Scenario {
  const deck = shuffleDeck(); const startRank = 4 + Math.floor(Math.random() * 7);
  const neededRanks = [startRank, startRank+1, startRank+2, startRank+3];
  const cards: Card[] = []; const used = new Set<string>();
  for (const rv of neededRanks) { const rank = RANKS[rv - 2]; const suit = SUITS[Math.floor(Math.random() * 4)]; cards.push({ rank, suit }); used.add(`${rank}${suit}`); }
  const extra = deck.find(c => !used.has(`${c.rank}${c.suit}`) && !neededRanks.includes(rankValue(c.rank)))!;
  const hand = [cards[0], cards[1]]; const community = [cards[2], cards[3], extra];
  const outs = 8; const rule42 = outs * 4;
  const potSize = 50 + Math.floor(Math.random() * 4) * 20; const betSize = 20 + Math.floor(Math.random() * 3) * 10;
  const potOdds = Math.round((betSize / (potSize + betSize)) * 100);
  return { hand, community, drawNameKey: "scenario.oesd", outs, rule42, potSize, betSize, potOdds, isCallProfitable: rule42 >= potOdds,
    explanationHe: `צריך קלף מלמעלה או מלמטה → 8 אאוטס. כלל ה-4: 8×4 = 32%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "קול רווחי! ✅" : "קול לא רווחי ❌"}`,
    explanationEn: `Need a card from above or below → 8 outs. Rule of 4: 8×4 = 32%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "Profitable call! ✅" : "Unprofitable call ❌"}`,
  };
}

function generateGutshot(): Scenario {
  const deck = shuffleDeck(); const startRank = 3 + Math.floor(Math.random() * 8);
  const indices = [0, 1, 3, 4]; const neededRanks = indices.map(i => startRank + i);
  const cards: Card[] = []; const used = new Set<string>();
  for (const rv of neededRanks) { const rank = RANKS[Math.min(rv - 2, 12)]; const suit = SUITS[Math.floor(Math.random() * 4)]; cards.push({ rank, suit }); used.add(`${rank}${suit}`); }
  const extra = deck.find(c => !used.has(`${c.rank}${c.suit}`) && !neededRanks.includes(rankValue(c.rank)))!;
  const hand = [cards[0], cards[1]]; const community = [cards[2], cards[3], extra];
  const outs = 4; const rule42 = outs * 4;
  const potSize = 40 + Math.floor(Math.random() * 4) * 20; const betSize = 15 + Math.floor(Math.random() * 3) * 10;
  const potOdds = Math.round((betSize / (potSize + betSize)) * 100);
  return { hand, community, drawNameKey: "scenario.gutshot", outs, rule42, potSize, betSize, potOdds, isCallProfitable: rule42 >= potOdds,
    explanationHe: `חסר קלף באמצע הרצף → 4 אאוטס. כלל ה-4: 4×4 = 16%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "קול רווחי! ✅" : "קול לא רווחי ❌"}`,
    explanationEn: `Missing a card in the middle → 4 outs. Rule of 4: 4×4 = 16%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "Profitable call! ✅" : "Unprofitable call ❌"}`,
  };
}

function generateOvercards(): Scenario {
  const deck = shuffleDeck();
  const hand: Card[] = [
    { rank: RANKS[10 + Math.floor(Math.random() * 3)], suit: SUITS[Math.floor(Math.random() * 4)] },
    { rank: RANKS[9 + Math.floor(Math.random() * 3)], suit: SUITS[Math.floor(Math.random() * 4)] },
  ];
  const used = new Set(hand.map(c => `${c.rank}${c.suit}`));
  const lowCards = deck.filter(c => rankValue(c.rank) <= 9 && !used.has(`${c.rank}${c.suit}`));
  const community = lowCards.slice(0, 3);
  const outs = 6; const rule42 = outs * 4;
  const potSize = 30 + Math.floor(Math.random() * 3) * 20; const betSize = 15 + Math.floor(Math.random() * 3) * 5;
  const potOdds = Math.round((betSize / (potSize + betSize)) * 100);
  return { hand, community, drawNameKey: "scenario.overcards", outs, rule42, potSize, betSize, potOdds, isCallProfitable: rule42 >= potOdds,
    explanationHe: `2 קלפים גבוהים מהבורד × 3 קלפים כל אחד → 6 אאוטס. כלל ה-4: 6×4 = 24%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "קול רווחי! ✅" : "קול לא רווחי ❌"}`,
    explanationEn: `2 cards higher than the board × 3 cards each → 6 outs. Rule of 4: 6×4 = 24%. Pot Odds: ${betSize}/(${potSize}+${betSize}) = ${potOdds}%. ${rule42 >= potOdds ? "Profitable call! ✅" : "Unprofitable call ❌"}`,
  };
}

const generators = [generateFlushDraw, generateOESD, generateGutshot, generateOvercards];
function generateScenario(): Scenario { return generators[Math.floor(Math.random() * generators.length)](); }

type Step = "outs" | "rule42" | "potodds" | "decision" | "done";

const ProbabilityPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;
  const [scenario, setScenario] = useState<Scenario>(generateScenario);
  const [step, setStep] = useState<Step>("outs");
  const [outsAnswer, setOutsAnswer] = useState("");
  const [rule42Answer, setRule42Answer] = useState("");
  const [potOddsAnswer, setPotOddsAnswer] = useState("");
  const [decisionAnswer, setDecisionAnswer] = useState<"call" | "fold" | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const checkOuts = useCallback(() => {
    const ans = parseInt(outsAnswer); const correct = ans === scenario.outs;
    setFeedback({ correct, msg: correct ? t("prob.correct.outs").replace("{n}", String(scenario.outs)) : t("prob.wrong.outs").replace("{n}", String(scenario.outs)) });
    if (correct) setScore(s => ({ ...s, correct: s.correct + 1 })); setScore(s => ({ ...s, total: s.total + 1 }));
    setTimeout(() => { setFeedback(null); setStep("rule42"); }, 1500);
  }, [outsAnswer, scenario, t]);

  const checkRule42 = useCallback(() => {
    const ans = parseInt(rule42Answer); const correct = Math.abs(ans - scenario.rule42) <= 2;
    setFeedback({ correct, msg: correct ? t("prob.correct.rule").replace("{n}", String(scenario.rule42)).replace("{outs}", String(scenario.outs)) : t("prob.wrong.rule").replace("{outs}", String(scenario.outs)).replace("{n}", String(scenario.rule42)) });
    if (correct) setScore(s => ({ ...s, correct: s.correct + 1 })); setScore(s => ({ ...s, total: s.total + 1 }));
    setTimeout(() => { setFeedback(null); setStep("potodds"); }, 1500);
  }, [rule42Answer, scenario, t]);

  const checkPotOdds = useCallback(() => {
    const ans = parseInt(potOddsAnswer); const correct = Math.abs(ans - scenario.potOdds) <= 3;
    setFeedback({ correct, msg: correct ? t("prob.correct.potodds").replace("{n}", String(scenario.potOdds)) : t("prob.wrong.potodds").replace("{bet}", String(scenario.betSize)).replace("{pot}", String(scenario.potSize)).replace("{n}", String(scenario.potOdds)) });
    if (correct) setScore(s => ({ ...s, correct: s.correct + 1 })); setScore(s => ({ ...s, total: s.total + 1 }));
    setTimeout(() => { setFeedback(null); setStep("decision"); }, 1500);
  }, [potOddsAnswer, scenario, t]);

  const checkDecision = useCallback((choice: "call" | "fold") => {
    setDecisionAnswer(choice); const correct = (choice === "call") === scenario.isCallProfitable;
    setFeedback({ correct, msg: correct ? t("prob.correct.decision") : scenario.isCallProfitable ? t("prob.wrong.decision.call") : t("prob.wrong.decision.fold") });
    if (correct) setScore(s => ({ ...s, correct: s.correct + 1 })); setScore(s => ({ ...s, total: s.total + 1 }));
    setTimeout(() => { setFeedback(null); setStep("done"); }, 1500);
  }, [scenario, t]);

  const nextScenario = useCallback(() => { setScenario(generateScenario()); setStep("outs"); setOutsAnswer(""); setRule42Answer(""); setPotOddsAnswer(""); setDecisionAnswer(null); setFeedback(null); }, []);
  const resetAll = useCallback(() => { nextScenario(); setScore({ correct: 0, total: 0 }); }, [nextScenario]);

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground p-2"><BackArrow className="h-5 w-5" /></Button>
          <h1 className="text-lg font-heading font-bold text-primary flex items-center gap-2"><Calculator className="h-5 w-5" />{t("prob.title")}</h1>
          <Button variant="ghost" onClick={resetAll} className="text-foreground p-2"><RotateCcw className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          <span className="text-primary font-bold">{score.correct}/{score.total}</span>
          {score.total > 0 && <span className="text-muted-foreground">{Math.round((score.correct / score.total) * 100)}%</span>}
        </div>

        <div className="bg-card rounded-xl gold-border p-3 mb-3 corner-accent">
          <p className="text-xs text-primary font-heading text-center mb-1">{t(scenario.drawNameKey)}</p>
          <p className="text-[10px] text-muted-foreground text-center mb-2">{t("prob.community")}</p>
          <div className="flex gap-1.5 justify-center mb-3">{scenario.community.map((card, i) => <PlayingCard key={i} card={card} small />)}</div>
          <p className="text-[10px] text-muted-foreground text-center mb-1">{t("prob.your.hand")}</p>
          <div className="flex gap-1.5 justify-center">{scenario.hand.map((card, i) => <PlayingCard key={i} card={card} small />)}</div>
        </div>

        <div className="bg-card rounded-lg gold-border p-2 mb-3 flex justify-around text-center text-xs">
          <div><p className="text-muted-foreground">{t("prob.pot")}</p><p className="text-primary font-bold">{scenario.potSize}</p></div>
          <div><p className="text-muted-foreground">{t("prob.opponent.bet")}</p><p className="text-primary font-bold">{scenario.betSize}</p></div>
        </div>

        <div className="space-y-3">
          <div className={`bg-card rounded-xl gold-border p-3 transition-opacity ${step === "outs" ? "opacity-100" : "opacity-50"}`}>
            <p className="text-xs font-heading text-primary mb-2">{t("prob.step1")}</p>
            {step === "outs" ? (
              <div className="flex gap-2">
                <input type="number" value={outsAnswer} onChange={e => setOutsAnswer(e.target.value)} placeholder={t("prob.step1.placeholder")} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center" />
                <Button onClick={checkOuts} disabled={!outsAnswer} className="bg-primary text-primary-foreground text-sm">{t("prob.check")}</Button>
              </div>
            ) : <p className="text-sm text-foreground text-center">{scenario.outs} {lang === "he" ? "אאוטס" : "outs"} ✓</p>}
          </div>

          {(step === "rule42" || step === "potodds" || step === "decision" || step === "done") && (
            <div className={`bg-card rounded-xl gold-border p-3 transition-opacity ${step === "rule42" ? "opacity-100" : "opacity-50"}`}>
              <p className="text-xs font-heading text-primary mb-2">{t("prob.step2")}</p>
              {step === "rule42" ? (
                <div className="flex gap-2">
                  <input type="number" value={rule42Answer} onChange={e => setRule42Answer(e.target.value)} placeholder={t("prob.step2.placeholder")} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center" />
                  <Button onClick={checkRule42} disabled={!rule42Answer} className="bg-primary text-primary-foreground text-sm">{t("prob.check")}</Button>
                </div>
              ) : <p className="text-sm text-foreground text-center">{scenario.rule42}% ✓</p>}
            </div>
          )}

          {(step === "potodds" || step === "decision" || step === "done") && (
            <div className={`bg-card rounded-xl gold-border p-3 transition-opacity ${step === "potodds" ? "opacity-100" : "opacity-50"}`}>
              <p className="text-xs font-heading text-primary mb-2">{t("prob.step3")}</p>
              {step === "potodds" ? (
                <div className="flex gap-2">
                  <input type="number" value={potOddsAnswer} onChange={e => setPotOddsAnswer(e.target.value)} placeholder={t("prob.step3.placeholder")} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center" />
                  <Button onClick={checkPotOdds} disabled={!potOddsAnswer} className="bg-primary text-primary-foreground text-sm">{t("prob.check")}</Button>
                </div>
              ) : <p className="text-sm text-foreground text-center">{scenario.potOdds}% ✓</p>}
            </div>
          )}

          {(step === "decision" || step === "done") && (
            <div className={`bg-card rounded-xl gold-border p-3 transition-opacity ${step === "decision" ? "opacity-100" : "opacity-50"}`}>
              <p className="text-xs font-heading text-primary mb-2">{t("prob.step4")}</p>
              {step === "decision" ? (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => checkDecision("call")} className="bg-green-700 hover:bg-green-600 text-foreground flex-1">{t("prob.call")}</Button>
                  <Button onClick={() => checkDecision("fold")} className="bg-red-800 hover:bg-red-700 text-foreground flex-1">{t("prob.fold")}</Button>
                </div>
              ) : (
                <p className="text-sm text-foreground text-center flex items-center justify-center gap-1">
                  {decisionAnswer === "call" ? (lang === "he" ? "קול" : "Call") : (lang === "he" ? "פולד" : "Fold")}
                  {(decisionAnswer === "call") === scenario.isCallProfitable ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                </p>
              )}
            </div>
          )}
        </div>

        {feedback && (
          <div className={`mt-3 p-3 rounded-lg text-sm text-center font-heading ${feedback.correct ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}>{feedback.msg}</div>
        )}

        {step === "done" && (
          <>
            <CoachBubble tip={lang === "he" ? scenario.explanationHe : scenario.explanationEn} />
            <Button onClick={nextScenario} className="w-full mt-3 bg-primary text-primary-foreground font-heading">{t("prob.next")}</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProbabilityPage;
