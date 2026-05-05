import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HandRank {
  rank: number;
  name: string;
  nameEn: string;
  description: string;
  example: string;
  cards: string[];
  rarity: string;
}

const handRankings: HandRank[] = [
  {
    rank: 1,
    name: "רויאל פלאש",
    nameEn: "Royal Flush",
    description: "A-K-Q-J-10 מאותו סמל. היד הנדירה והחזקה ביותר בפוקר.",
    example: "A♠ K♠ Q♠ J♠ 10♠",
    cards: ["A♠", "K♠", "Q♠", "J♠", "10♠"],
    rarity: "1 ל-649,740",
  },
  {
    rank: 2,
    name: "סטרייט פלאש",
    nameEn: "Straight Flush",
    description: "5 קלפים ברצף מאותו סמל.",
    example: "5♥ 6♥ 7♥ 8♥ 9♥",
    cards: ["5♥", "6♥", "7♥", "8♥", "9♥"],
    rarity: "1 ל-72,193",
  },
  {
    rank: 3,
    name: "קארה",
    nameEn: "Four of a Kind",
    description: "4 קלפים עם אותו ערך.",
    example: "K♠ K♥ K♦ K♣ 7♠",
    cards: ["K♠", "K♥", "K♦", "K♣", "7♠"],
    rarity: "1 ל-4,165",
  },
  {
    rank: 4,
    name: "פול האוס",
    nameEn: "Full House",
    description: "שלישייה + זוג.",
    example: "Q♠ Q♥ Q♦ 9♣ 9♠",
    cards: ["Q♠", "Q♥", "Q♦", "9♣", "9♠"],
    rarity: "1 ל-694",
  },
  {
    rank: 5,
    name: "פלאש",
    nameEn: "Flush",
    description: "5 קלפים מאותו סמל, לא ברצף.",
    example: "A♦ J♦ 8♦ 5♦ 3♦",
    cards: ["A♦", "J♦", "8♦", "5♦", "3♦"],
    rarity: "1 ל-508",
  },
  {
    rank: 6,
    name: "סטרייט",
    nameEn: "Straight",
    description: "5 קלפים ברצף, לא מאותו סמל.",
    example: "4♣ 5♠ 6♥ 7♦ 8♣",
    cards: ["4♣", "5♠", "6♥", "7♦", "8♣"],
    rarity: "1 ל-255",
  },
  {
    rank: 7,
    name: "שלישייה",
    nameEn: "Three of a Kind",
    description: "3 קלפים עם אותו ערך.",
    example: "J♠ J♥ J♦ 8♣ 3♠",
    cards: ["J♠", "J♥", "J♦", "8♣", "3♠"],
    rarity: "1 ל-47",
  },
  {
    rank: 8,
    name: "שני זוגות",
    nameEn: "Two Pair",
    description: "2 זוגות שונים + קלף נוסף.",
    example: "10♠ 10♥ 6♦ 6♣ A♠",
    cards: ["10♠", "10♥", "6♦", "6♣", "A♠"],
    rarity: "1 ל-21",
  },
  {
    rank: 9,
    name: "זוג",
    nameEn: "One Pair",
    description: "2 קלפים עם אותו ערך.",
    example: "A♠ A♥ K♦ 9♣ 4♠",
    cards: ["A♠", "A♥", "K♦", "9♣", "4♠"],
    rarity: "1 ל-2.4",
  },
  {
    rank: 10,
    name: "קלף גבוה",
    nameEn: "High Card",
    description: "אין קומבינציה — הקלף הגבוה ביותר קובע.",
    example: "A♠ J♦ 8♣ 5♥ 3♠",
    cards: ["A♠", "J♦", "8♣", "5♥", "3♠"],
    rarity: "1 ל-2",
  },
];

const suitColor = (card: string) => {
  if (card.includes("♥") || card.includes("♦")) return "text-accent";
  return "text-foreground";
};

const HandRankingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/lessons")} className="text-foreground p-2">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            דירוג ידיים
          </h1>
          <div className="w-9" />
        </div>

        <p className="text-center text-muted-foreground text-sm mb-6">
          מהחזקה ביותר לחלשה — עם דוגמאות והסתברות
        </p>

        {/* Hand rankings list */}
        <div className="flex flex-col gap-3">
          {handRankings.map((hand) => (
            <div
              key={hand.rank}
              className="bg-card rounded-xl gold-border p-4 corner-accent"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {hand.rank}
                  </span>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-primary">{hand.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{hand.nameEn}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {hand.rarity}
                </span>
              </div>

              <p className="text-xs text-foreground mb-2">{hand.description}</p>

              {/* Visual cards */}
              <div className="flex gap-1.5 justify-center">
                {hand.cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-foreground/95 rounded-md w-10 h-14 flex items-center justify-center shadow-md"
                  >
                    <span className={`text-xs font-bold ${suitColor(card)}`}>
                      {card}
                    </span>
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
