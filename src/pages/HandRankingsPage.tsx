import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface HandRank {
  rank: number;
  nameKey: string;
  nameEn: string;
  descriptionEn: string;
  descriptionHe: string;
  example: string;
  cards: string[];
  rarity: string;
}

const handRankings: HandRank[] = [
  { rank: 1, nameKey: "hand.royal_flush", nameEn: "Royal Flush", descriptionHe: "A-K-Q-J-10 מאותו סמל. היד הנדירה והחזקה ביותר בפוקר.", descriptionEn: "A-K-Q-J-10 of the same suit. The rarest and strongest hand in poker.", example: "A♠ K♠ Q♠ J♠ 10♠", cards: ["A♠", "K♠", "Q♠", "J♠", "10♠"], rarity: "1:649,740" },
  { rank: 2, nameKey: "hand.straight_flush", nameEn: "Straight Flush", descriptionHe: "5 קלפים ברצף מאותו סמל.", descriptionEn: "5 sequential cards of the same suit.", example: "5♥ 6♥ 7♥ 8♥ 9♥", cards: ["5♥", "6♥", "7♥", "8♥", "9♥"], rarity: "1:72,193" },
  { rank: 3, nameKey: "hand.four_of_a_kind", nameEn: "Four of a Kind", descriptionHe: "4 קלפים עם אותו ערך.", descriptionEn: "4 cards of the same rank.", example: "K♠ K♥ K♦ K♣ 7♠", cards: ["K♠", "K♥", "K♦", "K♣", "7♠"], rarity: "1:4,165" },
  { rank: 4, nameKey: "hand.full_house", nameEn: "Full House", descriptionHe: "שלישייה + זוג.", descriptionEn: "Three of a kind + a pair.", example: "Q♠ Q♥ Q♦ 9♣ 9♠", cards: ["Q♠", "Q♥", "Q♦", "9♣", "9♠"], rarity: "1:694" },
  { rank: 5, nameKey: "hand.flush", nameEn: "Flush", descriptionHe: "5 קלפים מאותו סמל, לא ברצף.", descriptionEn: "5 cards of the same suit, not in sequence.", example: "A♦ J♦ 8♦ 5♦ 3♦", cards: ["A♦", "J♦", "8♦", "5♦", "3♦"], rarity: "1:508" },
  { rank: 6, nameKey: "hand.straight", nameEn: "Straight", descriptionHe: "5 קלפים ברצף, לא מאותו סמל.", descriptionEn: "5 sequential cards, not of the same suit.", example: "4♣ 5♠ 6♥ 7♦ 8♣", cards: ["4♣", "5♠", "6♥", "7♦", "8♣"], rarity: "1:255" },
  { rank: 7, nameKey: "hand.three_of_a_kind", nameEn: "Three of a Kind", descriptionHe: "3 קלפים עם אותו ערך.", descriptionEn: "3 cards of the same rank.", example: "J♠ J♥ J♦ 8♣ 3♠", cards: ["J♠", "J♥", "J♦", "8♣", "3♠"], rarity: "1:47" },
  { rank: 8, nameKey: "hand.two_pair", nameEn: "Two Pair", descriptionHe: "2 זוגות שונים + קלף נוסף.", descriptionEn: "2 different pairs + one card.", example: "10♠ 10♥ 6♦ 6♣ A♠", cards: ["10♠", "10♥", "6♦", "6♣", "A♠"], rarity: "1:21" },
  { rank: 9, nameKey: "hand.pair", nameEn: "One Pair", descriptionHe: "2 קלפים עם אותו ערך.", descriptionEn: "2 cards of the same rank.", example: "A♠ A♥ K♦ 9♣ 4♠", cards: ["A♠", "A♥", "K♦", "9♣", "4♠"], rarity: "1:2.4" },
  { rank: 10, nameKey: "hand.high_card", nameEn: "High Card", descriptionHe: "אין קומבינציה — הקלף הגבוה ביותר קובע.", descriptionEn: "No combination — the highest card wins.", example: "A♠ J♦ 8♣ 5♥ 3♠", cards: ["A♠", "J♦", "8♣", "5♥", "3♠"], rarity: "1:2" },
];

const suitColor = (card: string) => {
  if (card.includes("♥") || card.includes("♦")) return "text-red-600";
  return "text-gray-900";
};

const HandRankingsPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/lessons")} className="text-foreground p-2">
            <BackArrow className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t("rankings.title")}
          </h1>
          <div className="w-9" />
        </div>

        <p className="text-center text-muted-foreground text-sm mb-6">
          {t("rankings.intro")}
        </p>

        <div className="flex flex-col gap-3">
          {handRankings.map((hand) => (
            <div key={hand.rank} className="bg-card rounded-xl gold-border p-4 corner-accent">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {hand.rank}
                  </span>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-primary">{t(hand.nameKey)}</h3>
                    <p className="text-[10px] text-muted-foreground">{hand.nameEn}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {hand.rarity}
                </span>
              </div>

              <p className="text-xs text-foreground mb-2">
                {lang === "he" ? hand.descriptionHe : hand.descriptionEn}
              </p>

              <div className="flex gap-1.5 justify-center">
                {hand.cards.map((card, idx) => (
                  <div key={idx} className="bg-foreground/95 rounded-md w-10 h-14 flex items-center justify-center shadow-md">
                    <span className={`text-xs font-bold ${suitColor(card)}`}>{card}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HandRankingsPage;
