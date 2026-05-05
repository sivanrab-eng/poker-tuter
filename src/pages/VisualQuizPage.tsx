import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, RotateCcw, Zap, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayingCard from "@/components/poker/PlayingCard";
import CoachBubble from "@/components/lessons/CoachBubble";
import type { Card, Rank, Suit } from "@/lib/pokerEngine";

// ---- helpers ----
const RANKS: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS: Suit[] = ["♠","♥","♦","♣"];

function shuffleDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function rankValue(r: Rank): number {
  const m: Record<Rank, number> = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
  return m[r];
}

function getCombinations(arr: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  return [...getCombinations(rest, k - 1).map(c => [first, ...c]), ...getCombinations(rest, k)];
}

function checkStraight(values: number[]): boolean {
  const u = [...new Set(values)].sort((a, b) => b - a);
  if (u.length < 5) return false;
  if (u[0] - u[4] === 4) return true;
  if (u.includes(14) && u.includes(2) && u.includes(3) && u.includes(4) && u.includes(5)) return true;
  return false;
}

interface HandEval { rank: number; name: string; kickers: number[] }

function evaluate5(cards: Card[]): HandEval {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  const values = sorted.map(c => rankValue(c.rank));
  const suits = sorted.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(values);
  const counts: Record<number, number> = {};
  values.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const groups = Object.entries(counts).map(([v, c]) => ({ value: Number(v), count: c })).sort((a, b) => b.count - a.count || b.value - a.value);

  if (isFlush && isStraight) {
    return values[0] === 14 && values[1] === 13
      ? { rank: 10, name: "רויאל פלאש", kickers: values }
      : { rank: 9, name: "סטרייט פלאש", kickers: values };
  }
  if (groups[0].count === 4) return { rank: 8, name: "קארה", kickers: [groups[0].value, groups[1].value] };
  if (groups[0].count === 3 && groups[1].count === 2) return { rank: 7, name: "פול האוס", kickers: [groups[0].value, groups[1].value] };
  if (isFlush) return { rank: 6, name: "פלאש", kickers: values };
  if (isStraight) return { rank: 5, name: "סטרייט", kickers: values };
  if (groups[0].count === 3) return { rank: 4, name: "שלישייה", kickers: [groups[0].value, ...groups.slice(1).map(g => g.value)] };
  if (groups[0].count === 2 && groups[1].count === 2) return { rank: 3, name: "שני זוגות", kickers: [groups[0].value, groups[1].value, groups[2].value] };
  if (groups[0].count === 2) return { rank: 2, name: "זוג", kickers: [groups[0].value, ...groups.slice(1).map(g => g.value)] };
  return { rank: 1, name: "קלף גבוה", kickers: values };
}

function evaluateHand(cards: Card[]): HandEval {
  let best: HandEval = { rank: 0, name: "", kickers: [] };
  for (const combo of getCombinations(cards, 5)) {
    const e = evaluate5(combo);
    if (e.rank > best.rank || (e.rank === best.rank && e.kickers.join() > best.kickers.join())) best = e;
  }
  return best;
}

function compareHands(a: HandEval, b: HandEval): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

interface QuizRound {
  handA: Card[];
  handB: Card[];
  community: Card[];
  evalA: HandEval;
  evalB: HandEval;
  winner: "a" | "b" | "tie";
}

function generateRound(): QuizRound {
  const deck = shuffleDeck();
  const handA = [deck.pop()!, deck.pop()!];
  const handB = [deck.pop()!, deck.pop()!];
  const community = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!];
  const evalA = evaluateHand([...handA, ...community]);
  const evalB = evaluateHand([...handB, ...community]);
  const cmp = compareHands(evalA, evalB);
  const winner = cmp > 0 ? "a" as const : cmp < 0 ? "b" as const : "tie" as const;
  return { handA, handB, community, evalA, evalB, winner };
}

const VisualQuizPage = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState<QuizRound>(generateRound);
  const [selected, setSelected] = useState<"a" | "b" | "tie" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const isCorrect = selected !== null && selected === round.winner;
  const isWrong = selected !== null && selected !== round.winner;
  const answered = selected !== null;

  const coachTip = useMemo(() => {
    if (!answered) return null;
    if (isCorrect) {
      const tips = [
        "מצוין! העין שלך מתחדדת 🎯",
        "נכון! אתה כבר מזהה כמו מקצוען 💪",
        "בול! המשך ככה 🔥",
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    return `התשובה הנכונה: ${round.winner === "a" ? "שחקן א׳" : round.winner === "b" ? "שחקן ב׳" : "תיקו"}. ${round.winner !== "tie" ? `${round.winner === "a" ? round.evalA.name : round.evalB.name} מנצח ${round.winner === "a" ? round.evalB.name : round.evalA.name}.` : "שתי הידיים שוות!"}`;
  }, [answered, isCorrect, round]);

  const handleSelect = useCallback((choice: "a" | "b" | "tie") => {
    if (answered) return;
    setSelected(choice);
    const correct = choice === round.winner;
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStreak(s => correct ? s + 1 : 0);
  }, [answered, round.winner]);

  const nextRound = useCallback(() => {
    setRound(generateRound());
    setSelected(null);
  }, []);

  const resetGame = useCallback(() => {
    setRound(generateRound());
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setStreak(0);
  }, []);

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground p-2">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
            <Zap className="h-5 w-5" />
            מי מנצח?
          </h1>
          <Button variant="ghost" onClick={resetGame} className="text-foreground p-2">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          <span className="text-primary font-bold">{score.correct}/{score.total}</span>
          {streak >= 2 && (
            <span className="text-primary flex items-center gap-1 animate-pulse">
              🔥 רצף {streak}
            </span>
          )}
          {score.total > 0 && (
            <span className="text-muted-foreground">
              {Math.round((score.correct / score.total) * 100)}%
            </span>
          )}
        </div>

        {/* Community cards */}
        <div className="bg-card rounded-xl gold-border p-3 mb-3 corner-accent">
          <p className="text-xs text-muted-foreground text-center mb-2">קלפים קהילתיים</p>
          <div className="flex gap-1.5 justify-center">
            {round.community.map((card, i) => (
              <PlayingCard key={i} card={card} small />
            ))}
          </div>
        </div>

        {/* Two hands */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Hand A */}
          <button
            onClick={() => handleSelect("a")}
            className={`bg-card rounded-xl p-3 transition-all border-2 ${
              !answered ? "border-border hover:border-primary/60 cursor-pointer" :
              round.winner === "a" ? "border-green-500 ring-2 ring-green-500/30" :
              selected === "a" ? "border-red-500 ring-2 ring-red-500/30" : "border-border opacity-60"
            }`}
          >
            <p className="text-xs font-heading text-primary text-center mb-2">שחקן א׳</p>
            <div className="flex gap-1 justify-center">
              {round.handA.map((card, i) => (
                <PlayingCard key={i} card={card} small />
              ))}
            </div>
            {answered && (
              <p className="text-[10px] text-center mt-2 text-muted-foreground">{round.evalA.name}</p>
            )}
            {answered && round.winner === "a" && (
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mt-1" />
            )}
            {answered && selected === "a" && round.winner !== "a" && (
              <XCircle className="h-5 w-5 text-red-500 mx-auto mt-1" />
            )}
          </button>

          {/* Hand B */}
          <button
            onClick={() => handleSelect("b")}
            className={`bg-card rounded-xl p-3 transition-all border-2 ${
              !answered ? "border-border hover:border-primary/60 cursor-pointer" :
              round.winner === "b" ? "border-green-500 ring-2 ring-green-500/30" :
              selected === "b" ? "border-red-500 ring-2 ring-red-500/30" : "border-border opacity-60"
            }`}
          >
            <p className="text-xs font-heading text-primary text-center mb-2">שחקן ב׳</p>
            <div className="flex gap-1 justify-center">
              {round.handB.map((card, i) => (
                <PlayingCard key={i} card={card} small />
              ))}
            </div>
            {answered && (
              <p className="text-[10px] text-center mt-2 text-muted-foreground">{round.evalB.name}</p>
            )}
            {answered && round.winner === "b" && (
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mt-1" />
            )}
            {answered && selected === "b" && round.winner !== "b" && (
              <XCircle className="h-5 w-5 text-red-500 mx-auto mt-1" />
            )}
          </button>
        </div>

        {/* Tie button */}
        <button
          onClick={() => handleSelect("tie")}
          className={`w-full py-2 rounded-lg text-sm font-heading transition-all border-2 mb-3 ${
            !answered ? "bg-card border-border hover:border-primary/60 text-foreground cursor-pointer" :
            round.winner === "tie" ? "bg-card border-green-500 ring-2 ring-green-500/30 text-foreground" :
            selected === "tie" ? "bg-card border-red-500 ring-2 ring-red-500/30 text-foreground" : "bg-card border-border opacity-60 text-foreground"
          }`}
        >
          🤝 תיקו
          {answered && round.winner === "tie" && <CheckCircle2 className="inline h-4 w-4 text-green-500 mr-1" />}
          {answered && selected === "tie" && round.winner !== "tie" && <XCircle className="inline h-4 w-4 text-red-500 mr-1" />}
        </button>

        {/* Coach tip */}
        {answered && coachTip && <CoachBubble tip={coachTip} />}

        {/* Next button */}
        {answered && (
          <Button onClick={nextRound} className="w-full mt-3 bg-primary text-primary-foreground font-heading">
            שאלה הבאה ←
          </Button>
        )}
      </div>
    </div>
  );
};

export default VisualQuizPage;
