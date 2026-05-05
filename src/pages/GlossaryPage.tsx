import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Languages, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { GlossaryTerm } from "@/lib/pokerGlossary";

const glossaryData: Record<string, { he: GlossaryTerm; en: GlossaryTerm }> = {
  'preflop': {
    he: { term: 'פרה-פלופ (Pre-Flop)', explanation: 'השלב הראשון במשחק, לפני שנחשפים קלפים קהילתיים. כל שחקן מחזיק רק 2 קלפים.' },
    en: { term: 'Pre-Flop', explanation: 'The first betting round, before any community cards are revealed. Each player holds only 2 cards.' },
  },
  'flop': {
    he: { term: 'פלופ (Flop)', explanation: 'שלושת הקלפים הקהילתיים הראשונים שנחשפים על השולחן.' },
    en: { term: 'Flop', explanation: 'The first three community cards dealt face-up on the table.' },
  },
  'turn': {
    he: { term: 'טרן (Turn)', explanation: 'הקלף הקהילתי הרביעי. נקרא גם "Fourth Street".' },
    en: { term: 'Turn', explanation: 'The fourth community card. Also called "Fourth Street".' },
  },
  'river': {
    he: { term: 'ריבר (River)', explanation: 'הקלף הקהילתי החמישי והאחרון. ההזדמנות האחרונה להמר.' },
    en: { term: 'River', explanation: 'The fifth and final community card. The last chance to bet.' },
  },
  'showdown': {
    he: { term: 'שואדאון (Showdown)', explanation: 'חשיפת הקלפים בסוף היד. מי שמחזיק ביד הטובה ביותר זוכה בפוט.' },
    en: { term: 'Showdown', explanation: 'The revealing of cards at the end of the hand. The best hand wins the pot.' },
  },
  'fold': {
    he: { term: 'פולד (Fold)', explanation: 'ויתור על היד. מפסידים את מה שכבר הושקע בפוט, אך לא מסתכנים בעוד.' },
    en: { term: 'Fold', explanation: 'Surrendering your hand. You lose what you\'ve invested but risk no more.' },
  },
  'check': {
    he: { term: "צ'ק (Check)", explanation: 'העברת התור בלי להמר, כשאין הימור פתוח. אפשרי רק כשאף אחד לא העלה.' },
    en: { term: 'Check', explanation: 'Passing your turn without betting, when no bet is open. Only possible when no one has raised.' },
  },
  'call': {
    he: { term: 'קול (Call)', explanation: 'השוואת ההימור של היריב. משלמים את אותו סכום כדי להישאר ביד.' },
    en: { term: 'Call', explanation: 'Matching the opponent\'s bet. You pay the same amount to stay in the hand.' },
  },
  'raise': {
    he: { term: 'רייז (Raise)', explanation: 'העלאת ההימור. מכריח את היריב להחליט אם לעקוב, להעלות שוב, או לעזוב.' },
    en: { term: 'Raise', explanation: 'Increasing the bet. Forces opponents to decide whether to call, re-raise, or fold.' },
  },
  'pot': {
    he: { term: 'פוט (Pot)', explanation: 'סך כל ההימורים באמצע השולחן. הזוכה לוקח הכל.' },
    en: { term: 'Pot', explanation: 'The total of all bets in the center of the table. The winner takes it all.' },
  },
  'equity': {
    he: { term: 'אקוויטי (Equity)', explanation: 'אחוז הסיכוי שלך לזכות ביד על בסיס הקלפים הנוכחיים. 50% = סיכוי שווה.' },
    en: { term: 'Equity', explanation: 'Your percentage chance of winning the hand based on current cards. 50% = even chance.' },
  },
  'ev': {
    he: { term: 'EV (Expected Value)', explanation: 'הערך הצפוי — כמה כסף תרוויח או תפסיד בממוצע מפעולה מסוימת לאורך זמן.' },
    en: { term: 'EV (Expected Value)', explanation: 'How much money you\'ll win or lose on average from a specific action over time.' },
  },
  'outs': {
    he: { term: 'אאוטס (Outs)', explanation: 'הקלפים שנשארו בחפיסה שיכולים לשפר את היד שלך. יותר אאוטס = סיכוי גבוה יותר.' },
    en: { term: 'Outs', explanation: 'Cards remaining in the deck that can improve your hand. More outs = higher chance.' },
  },
  'blind': {
    he: { term: 'בלינד (Blind)', explanation: 'הימור כפוי לפני חלוקת הקלפים. יש בלינד קטן ובלינד גדול.' },
    en: { term: 'Blind', explanation: 'A forced bet before cards are dealt. There\'s a small blind and a big blind.' },
  },
  'flush': {
    he: { term: 'פלאש (Flush)', explanation: '5 קלפים מאותו סמל (לב, יהלום, תלתן, עלה). יד חזקה מאוד.' },
    en: { term: 'Flush', explanation: '5 cards of the same suit (hearts, diamonds, clubs, spades). A very strong hand.' },
  },
  'straight': {
    he: { term: 'סטרייט (Straight)', explanation: '5 קלפים ברצף (לדוגמה: 5-6-7-8-9). לא חייב להיות מאותו סמל.' },
    en: { term: 'Straight', explanation: '5 sequential cards (e.g., 5-6-7-8-9). Doesn\'t have to be the same suit.' },
  },
  'pair': {
    he: { term: 'זוג (Pair)', explanation: 'שני קלפים עם אותו ערך. זוג אסים הוא הזוג הגבוה ביותר.' },
    en: { term: 'Pair', explanation: 'Two cards of the same rank. A pair of aces is the highest pair.' },
  },
  'three_of_a_kind': {
    he: { term: 'שלישייה (Three of a Kind)', explanation: 'שלושה קלפים עם אותו ערך. נקרא גם "טריפס" או "סט".' },
    en: { term: 'Three of a Kind', explanation: 'Three cards of the same rank. Also called "trips" or "set".' },
  },
  'full_house': {
    he: { term: 'פול האוס (Full House)', explanation: 'שלישייה + זוג. לדוגמה: שלושה מלכים + שני עשרות.' },
    en: { term: 'Full House', explanation: 'Three of a kind + a pair. For example: three kings + two tens.' },
  },
};

const GlossaryPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;
  const [search, setSearch] = useState("");

  const terms = Object.values(glossaryData)
    .map(entry => entry[lang])
    .filter(term => term.term.toLowerCase().includes(search.toLowerCase()) || term.explanation.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/lessons")} className="text-foreground p-2">
            <BackArrow className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t("glossary.title")}
          </h1>
          <div className="w-9" />
        </div>

        <div className="relative mb-5">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("glossary.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          {terms.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">{t("glossary.empty")}</p>
          )}
          {terms.map((term) => (
            <div key={term.term} className="bg-card rounded-xl gold-border p-4">
              <h3 className="text-sm font-heading font-bold text-primary mb-1">{term.term}</h3>
              <p className="text-xs text-foreground leading-relaxed">{term.explanation}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-[10px] mt-6">
          {t("glossary.count").replace("{n}", String(Object.keys(glossaryData).length))}
        </p>
      </div>
    </div>
  );
};

export default GlossaryPage;
