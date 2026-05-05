import type { Language } from "@/lib/i18n";

export interface LessonData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  sections: {
    title: string;
    paragraphs: string[];
    example?: { title?: string; content: string };
    coachTip?: string;
  }[];
}

const lessonsHe: LessonData[] = [
  {
    id: 1, slug: "lesson-1",
    title: "מבוא לטקסס הולדם",
    subtitle: "חוקי המשחק הבסיסיים — הכל מתחיל כאן",
    sections: [
      { title: "מה זה טקסס הולדם?", paragraphs: ["טקסס הולדם הוא משחק הפוקר הפופולרי בעולם. כל שחקן מקבל 2 קלפים סגורים (Hole Cards) ומשתמש ב-5 קלפים קהילתיים שנחשפים על השולחן כדי להרכיב את היד הטובה ביותר מ-5 קלפים.", "המטרה: לזכות בפוט — הסכום שנצבר מהימורי כל השחקנים."], coachTip: "זכרו — אתם לא חייבים להראות את הקלפים שלכם! אפשר לנצח גם בלי היד הכי טובה, פשוט על ידי גרימה ליריב לעשות פולד." },
      { title: "מבנה היד — 4 שלבים", paragraphs: ["כל יד בטקסס הולדם מורכבת מ-4 סבבי הימורים:", "1. פרה-פלופ — כל שחקן מקבל 2 קלפים. סבב הימורים ראשון.", "2. פלופ — 3 קלפים קהילתיים נחשפים. סבב הימורים שני.", "3. טרן — קלף קהילתי רביעי. סבב הימורים שלישי.", "4. ריבר — קלף קהילתי חמישי ואחרון. סבב הימורים אחרון."], example: { content: "קלפי השחקן: A♠ K♥ | פלופ: 10♠ J♠ Q♦ | השחקן כבר הרכיב סטרייט! (10-J-Q-K-A)" }, coachTip: "בפרה-פלופ יש לכם הכי פחות מידע. ככל שמתקדמים בשלבים, אפשר לקבל החלטות חכמות יותר." },
      { title: "הפעולות האפשריות", paragraphs: ["בכל סבב הימורים, השחקן יכול לבצע אחת מהפעולות הבאות:", "• צ'ק — העברת התור בלי להמר (רק אם אין הימור פתוח).", "• קול — התאמה להימור של היריב.", "• רייז — העלאת ההימור.", "• פולד — ויתור על היד."], coachTip: "טעות נפוצה של מתחילים: לעשות קול על כל דבר. לפעמים פולד הוא המהלך הכי חכם!" },
      { title: "הבליינדים", paragraphs: ["לפני שמחלקים קלפים, שני שחקנים חייבים לשים הימור כפוי — בלינד קטן ובלינד גדול.", "הבלינד הגדול הוא בדרך כלל פי 2 מהבלינד הקטן. המיקום מסתובב אחרי כל יד."], example: { title: "דוגמה לבליינדים", content: "במשחק 1/2 — הבלינד הקטן שם 1, הבלינד הגדול שם 2. כל שחקן אחר צריך לפחות להשוות ל-2 כדי להישאר ביד." } },
    ],
  },
  {
    id: 2, slug: "lesson-2",
    title: "דירוג ידיים בפוקר",
    subtitle: "מהחזקה ביותר לחלשה — תדעו בדיוק מה שווה",
    sections: [
      { title: "9 הידיים מהחזקה לחלשה", paragraphs: ["בפוקר, כל יד מורכבת מ-5 קלפים. הנה הסדר מהחזקה ביותר:", "1. 🏆 רויאל פלאש — A-K-Q-J-10 מאותו סמל. היד הנדירה ביותר.", "2. סטרייט פלאש — 5 קלפים ברצף מאותו סמל.", "3. קארה — 4 קלפים זהים (לדוגמה: 4 מלכים).", "4. פול האוס — שלישייה + זוג.", "5. פלאש — 5 קלפים מאותו סמל (לא ברצף).", "6. סטרייט — 5 קלפים ברצף (לא מאותו סמל).", "7. שלישייה — 3 קלפים זהים.", "8. שני זוגות — 2 זוגות שונים.", "9. זוג — 2 קלפים זהים.", "10. קלף גבוה — כשאין שום קומבינציה."], coachTip: "לא צריך לשנן — צריך להרגיש! ככל שתשחקו יותר, תזהו ידיים ברגע. זו המטרה של האימון הוויזואלי." },
      { title: "מה קובע כשיש תיקו?", paragraphs: ["כששני שחקנים מחזיקים באותו סוג יד, הקיקר (Kicker) קובע — הקלף הגבוה ביותר שלא חלק מהקומבינציה."], example: { content: "שחקן א׳: A♠ K♥ (זוג אסים עם קיקר K) | שחקן ב׳: A♦ Q♣ (זוג אסים עם קיקר Q) → שחקן א׳ מנצח!" }, coachTip: "הקיקר הוא אחד הדברים שמתחילים שוכחים. תמיד שימו לב לקלף הנלווה — הוא יכול להכריע!" },
      { title: "סמלים — האם יש חשיבות?", paragraphs: ["בטקסס הולדם, לסמלים (לב, יהלום, תלתן, עלה) אין דירוג ביניהם. הם חשובים רק כשבונים פלאש.", "לדוגמה: פלאש לבבות ופלאש עלים — שווים. מה שקובע הוא הקלף הגבוה ביותר בפלאש."] },
    ],
  },
  {
    id: 3, slug: "lesson-3",
    title: "אסטרטגיית פרה-פלופ",
    subtitle: "אילו ידיים לשחק ומאיזה מיקום",
    sections: [
      { title: "לא כל יד שווה משחק", paragraphs: ["הטעות הגדולה ביותר של מתחילים: לשחק יותר מדי ידיים. שחקן טוב משחק רק 15-25% מהידיים שהוא מקבל.", "ידיים פרימיום: AA, KK, QQ, AK suited — תמיד כדאי לשחק.", "ידיים טובות: JJ, 10-10, AQ, KQ suited — שווה לשחק ברוב המצבים.", "ידיים חלשות: 7-2 offsuit, 8-3, 9-4 — כמעט תמיד פולד."], coachTip: "כלל אצבע: אם אתם לא בטוחים — עשו פולד. ידיים טובות יגיעו. סבלנות היא המפתח!" },
      { title: "חשיבות המיקום", paragraphs: ["המיקום שלכם ביחס לדילר משפיע מאוד על איך כדאי לשחק:", "• מיקום מוקדם (UTG) — שחקו רק ידיים חזקות מאוד. אתם פועלים ראשונים.", "• מיקום אמצעי — אפשר להרחיב קצת את טווח הידיים.", "• מיקום מאוחר (Button/Cutoff) — הכי טוב! אתם פועלים אחרונים ורואים מה כולם עושים."], example: { content: "עם A♠ 10♥ — ממיקום מוקדם עדיף פולד. מהכפתור (Button) — בהחלט שווה רייז!" }, coachTip: "המיקום הוא כמו מידע — ומידע זה כוח. ככל שאתם פועלים מאוחר יותר, יש לכם יתרון גדול יותר." },
      { title: "גודל הרייז בפרה-פלופ", paragraphs: ["רייז סטנדרטי בפרה-פלופ הוא 2.5 עד 3 פעמים הבלינד הגדול.", "אם מישהו כבר עשה קול לפניכם, הוסיפו עוד בלינד אחד לכל שחקן שנכנס."], example: { title: "חישוב רייז", content: "בליינדים 1/2: רייז סטנדרטי = 5-6. אם 2 שחקנים כבר עשו קול, רייז ל-8." } },
    ],
  },
  {
    id: 4, slug: "lesson-4",
    title: "חשיבה פוסט-פלופ",
    subtitle: "איך לקרוא את הבורד ולקבל החלטות",
    sections: [
      { title: "קריאת הבורד", paragraphs: ["אחרי הפלופ, צריך להבין לא רק מה היד שלכם — אלא מה האפשרויות של היריב.", "בורד 'רטוב' (Wet): הרבה אפשרויות לסטרייט ופלאש. לדוגמה: 8♠ 9♠ 10♥.", "בורד 'יבש' (Dry): מעט אפשרויות. לדוגמה: K♦ 7♣ 2♠."], coachTip: "על בורד רטוב — היזהרו! גם אם יש לכם יד טובה, היריב יכול לשפר בקלות. על בורד יבש — אפשר להיות אגרסיביים יותר." },
      { title: "דרואו ואאוטים", paragraphs: ["דרואו (Draw) = יד שצריכה עוד קלף אחד כדי להשתפר משמעותית.", "פלאש דרואו: 4 קלפים מאותו סמל, חסר 1 — 9 אאוטס.", "סטרייט דרואו פתוח: חסר קלף מצד אחד — 8 אאוטס.", "כלל ה-4 וה-2: הכפילו את מספר האאוטים ב-4 (בפלופ) או ב-2 (בטרן) לקבלת אחוז הסיכוי."], example: { content: "יד: A♠ 5♠ | פלופ: 2♠ 8♠ K♥ | יש לכם 9 אאוטס (כל קלף ♠). סיכוי בפלופ: 9×4 = 36% להשלים פלאש." }, coachTip: "כלל ה-4 וה-2 הוא קירוב מהיר ומדויק מספיק. תתרגלו אותו עד שהוא הופך לאוטומטי!" },
      { title: "Pot Odds — כדאיות הימור", paragraphs: ["Pot Odds = היחס בין מה שצריך לשלם לבין מה שאפשר לזכות בו.", "אם הפוט הוא 100 והיריב מהמר 50, אתם צריכים לשים 50 כדי לזכות ב-150 (=פוט+הימור). היחס: 50/150 = 33%.", "אם הסיכוי שלכם להשלים את היד גבוה מ-33%, שווה לעשות קול!"], example: { title: "Pot Odds בפעולה", content: "פוט: 80 | היריב מהמר 40 | צריך לשלם 40 לזכות ב-120 | Pot Odds = 33% | יש לכם פלאש דרואו (36%) → קול משתלם!" }, coachTip: "Pot Odds הם הכלי הכי חזק של שחקן חושב. ברגע שתפנימו את העיקרון, תשחקו טוב יותר מ-90% מהמתחילים." },
    ],
  },
];

const lessonsEn: LessonData[] = [
  {
    id: 1, slug: "lesson-1",
    title: "Introduction to Texas Hold'em",
    subtitle: "Basic rules — it all starts here",
    sections: [
      { title: "What is Texas Hold'em?", paragraphs: ["Texas Hold'em is the most popular poker game in the world. Each player receives 2 hole cards and uses 5 community cards revealed on the table to form the best 5-card hand.", "The goal: win the pot — the total amount from all players' bets."], coachTip: "Remember — you don't have to show your cards! You can win without the best hand, simply by making your opponent fold." },
      { title: "Hand Structure — 4 Stages", paragraphs: ["Every hand in Texas Hold'em consists of 4 betting rounds:", "1. Pre-Flop — each player gets 2 cards. First betting round.", "2. Flop — 3 community cards revealed. Second betting round.", "3. Turn — 4th community card. Third betting round.", "4. River — 5th and final community card. Last betting round."], example: { content: "Player's cards: A♠ K♥ | Flop: 10♠ J♠ Q♦ | The player already has a straight! (10-J-Q-K-A)" }, coachTip: "In pre-flop you have the least information. As you advance through stages, you can make smarter decisions." },
      { title: "Available Actions", paragraphs: ["In each betting round, the player can perform one of these actions:", "• Check — pass your turn without betting (only if no bet is open).", "• Call — match the opponent's bet.", "• Raise — increase the bet.", "• Fold — surrender the hand."], coachTip: "Common beginner mistake: calling everything. Sometimes folding is the smartest move!" },
      { title: "The Blinds", paragraphs: ["Before dealing cards, two players must post a forced bet — a small blind and a big blind.", "The big blind is usually 2x the small blind. Positions rotate after each hand."], example: { title: "Blinds Example", content: "In a 1/2 game — the small blind posts 1, the big blind posts 2. Every other player must at least match 2 to stay in the hand." } },
    ],
  },
  {
    id: 2, slug: "lesson-2",
    title: "Poker Hand Rankings",
    subtitle: "From strongest to weakest — know exactly what's worth what",
    sections: [
      { title: "The 9 Hands from Strongest to Weakest", paragraphs: ["In poker, every hand consists of 5 cards. Here's the order from strongest:", "1. 🏆 Royal Flush — A-K-Q-J-10 of the same suit. The rarest hand.", "2. Straight Flush — 5 sequential cards of the same suit.", "3. Four of a Kind — 4 identical cards (e.g., 4 kings).", "4. Full House — three of a kind + a pair.", "5. Flush — 5 cards of the same suit (not sequential).", "6. Straight — 5 sequential cards (not same suit).", "7. Three of a Kind — 3 identical cards.", "8. Two Pair — 2 different pairs.", "9. One Pair — 2 identical cards.", "10. High Card — when there's no combination."], coachTip: "You don't need to memorize — you need to feel it! The more you play, the faster you'll recognize hands. That's the goal of visual training." },
      { title: "What decides a tie?", paragraphs: ["When two players hold the same type of hand, the Kicker decides — the highest card not part of the combination."], example: { content: "Player A: A♠ K♥ (pair of aces with K kicker) | Player B: A♦ Q♣ (pair of aces with Q kicker) → Player A wins!" }, coachTip: "The kicker is one of the things beginners forget. Always pay attention to the side card — it can be decisive!" },
      { title: "Suits — Do they matter?", paragraphs: ["In Texas Hold'em, suits (hearts, diamonds, clubs, spades) have no ranking between them. They only matter when building a flush.", "For example: a hearts flush and a spades flush are equal. What matters is the highest card in the flush."] },
    ],
  },
  {
    id: 3, slug: "lesson-3",
    title: "Pre-Flop Strategy",
    subtitle: "Which hands to play and from which position",
    sections: [
      { title: "Not every hand is worth playing", paragraphs: ["The biggest mistake beginners make: playing too many hands. A good player only plays 15-25% of hands dealt.", "Premium hands: AA, KK, QQ, AK suited — always worth playing.", "Good hands: JJ, 10-10, AQ, KQ suited — worth playing in most situations.", "Weak hands: 7-2 offsuit, 8-3, 9-4 — almost always fold."], coachTip: "Rule of thumb: if you're not sure — fold. Good hands will come. Patience is key!" },
      { title: "Position Importance", paragraphs: ["Your position relative to the dealer greatly affects how to play:", "• Early position (UTG) — play only very strong hands. You act first.", "• Middle position — can slightly widen your range.", "• Late position (Button/Cutoff) — the best! You act last and see what everyone does."], example: { content: "With A♠ 10♥ — from early position it's better to fold. From the Button — definitely worth a raise!" }, coachTip: "Position is like information — and information is power. The later you act, the bigger your advantage." },
      { title: "Pre-Flop Raise Sizing", paragraphs: ["A standard pre-flop raise is 2.5 to 3 times the big blind.", "If someone already called before you, add one more blind for each player who entered."], example: { title: "Raise Calculation", content: "Blinds 1/2: standard raise = 5-6. If 2 players already called, raise to 8." } },
    ],
  },
  {
    id: 4, slug: "lesson-4",
    title: "Post-Flop Thinking",
    subtitle: "How to read the board and make decisions",
    sections: [
      { title: "Reading the Board", paragraphs: ["After the flop, you need to understand not just your hand — but your opponent's possibilities.", "Wet board: many straight and flush possibilities. E.g.: 8♠ 9♠ 10♥.", "Dry board: few possibilities. E.g.: K♦ 7♣ 2♠."], coachTip: "On a wet board — be careful! Even with a good hand, the opponent can improve easily. On a dry board — you can be more aggressive." },
      { title: "Draws and Outs", paragraphs: ["Draw = a hand that needs one more card to improve significantly.", "Flush draw: 4 cards of the same suit, missing 1 — 9 outs.", "Open-ended straight draw: missing a card on one end — 8 outs.", "Rule of 4 and 2: multiply your outs by 4 (on flop) or 2 (on turn) for the percentage chance."], example: { content: "Hand: A♠ 5♠ | Flop: 2♠ 8♠ K♥ | You have 9 outs (every ♠). Chance on flop: 9×4 = 36% to complete the flush." }, coachTip: "The Rule of 4 and 2 is a quick and accurate enough approximation. Practice it until it becomes automatic!" },
      { title: "Pot Odds — Betting Value", paragraphs: ["Pot Odds = the ratio between what you need to pay and what you can win.", "If the pot is 100 and the opponent bets 50, you need to put 50 to win 150 (=pot+bet). The ratio: 50/150 = 33%.", "If your chance to complete the hand is higher than 33%, it's worth calling!"], example: { title: "Pot Odds in Action", content: "Pot: 80 | Opponent bets 40 | Need to pay 40 to win 120 | Pot Odds = 33% | You have a flush draw (36%) → Profitable call!" }, coachTip: "Pot Odds are the most powerful tool for a thinking player. Once you internalize the principle, you'll play better than 90% of beginners." },
    ],
  },
];

export function getLessons(lang: Language): LessonData[] {
  return lang === "he" ? lessonsHe : lessonsEn;
}

// Keep backwards compat
export const lessons = lessonsHe;
