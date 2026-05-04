// Poker glossary - clickable terms with explanations

export interface GlossaryTerm {
  term: string;
  explanation: string;
}

export const glossary: Record<string, GlossaryTerm> = {
  'פרה-פלופ': {
    term: 'פרה-פלופ (Pre-Flop)',
    explanation: 'השלב הראשון במשחק, לפני שנחשפים קלפים קהילתיים. כל שחקן מחזיק רק 2 קלפים.',
  },
  'פלופ': {
    term: 'פלופ (Flop)',
    explanation: 'שלושת הקלפים הקהילתיים הראשונים שנחשפים על השולחן.',
  },
  'טרן': {
    term: 'טרן (Turn)',
    explanation: 'הקלף הקהילתי הרביעי. נקרא גם "Fourth Street".',
  },
  'ריבר': {
    term: 'ריבר (River)',
    explanation: 'הקלף הקהילתי החמישי והאחרון. ההזדמנות האחרונה להמר.',
  },
  'שואדאון': {
    term: 'שואדאון (Showdown)',
    explanation: 'חשיפת הקלפים בסוף היד. מי שמחזיק ביד הטובה ביותר זוכה בפוט.',
  },
  'פולד': {
    term: 'פולד (Fold)',
    explanation: 'ויתור על היד. מפסידים את מה שכבר הושקע בפוט, אך לא מסתכנים בעוד.',
  },
  "צ'ק": {
    term: "צ'ק (Check)",
    explanation: 'העברת התור בלי להמר, כשאין הימור פתוח. אפשרי רק כשאף אחד לא העלה.',
  },
  'קול': {
    term: 'קול (Call)',
    explanation: 'השוואת ההימור של היריב. משלמים את אותו סכום כדי להישאר ביד.',
  },
  'רייז': {
    term: 'רייז (Raise)',
    explanation: 'העלאת ההימור. מכריח את היריב להחליט אם לעקוב, להעלות שוב, או לעזוב.',
  },
  'פוט': {
    term: 'פוט (Pot)',
    explanation: 'סך כל ההימורים באמצע השולחן. הזוכה לוקח הכל.',
  },
  'אקוויטי': {
    term: 'אקוויטי (Equity)',
    explanation: 'אחוז הסיכוי שלך לזכות ביד על בסיס הקלפים הנוכחיים. 50% = סיכוי שווה.',
  },
  'EV': {
    term: 'EV (Expected Value)',
    explanation: 'הערך הצפוי — כמה כסף תרוויח או תפסיד בממוצע מפעולה מסוימת לאורך זמן.',
  },
  'אאוטס': {
    term: 'אאוטס (Outs)',
    explanation: 'הקלפים שנשארו בחפיסה שיכולים לשפר את היד שלך. יותר אאוטס = סיכוי גבוה יותר.',
  },
  'בלינד': {
    term: 'בלינד (Blind)',
    explanation: 'הימור כפוי לפני חלוקת הקלפים. יש בלינד קטן ובלינד גדול.',
  },
  'פלאש': {
    term: 'פלאש (Flush)',
    explanation: '5 קלפים מאותו סמל (לב, יהלום, תלתן, עלה). יד חזקה מאוד.',
  },
  'סטרייט': {
    term: 'סטרייט (Straight)',
    explanation: '5 קלפים ברצף (לדוגמה: 5-6-7-8-9). לא חייב להיות מאותו סמל.',
  },
  'זוג': {
    term: 'זוג (Pair)',
    explanation: 'שני קלפים עם אותו ערך. זוג אסים הוא הזוג הגבוה ביותר.',
  },
  'שלישייה': {
    term: 'שלישייה (Three of a Kind)',
    explanation: 'שלושה קלפים עם אותו ערך. נקרא גם "טריפס" או "סט".',
  },
  'פול האוס': {
    term: 'פול האוס (Full House)',
    explanation: 'שלישייה + זוג. לדוגמה: שלושה מלכים + שני עשרות.',
  },
};

// Find glossary terms in text and return segments
export interface TextSegment {
  text: string;
  isTerm: boolean;
  termKey?: string;
}

export function parseTextWithTerms(text: string): TextSegment[] {
  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const segments: TextSegment[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    let earliestIndex = remaining.length;
    let matchedTerm = '';
    
    for (const term of terms) {
      const idx = remaining.indexOf(term);
      if (idx !== -1 && idx < earliestIndex) {
        earliestIndex = idx;
        matchedTerm = term;
      }
    }
    
    if (matchedTerm) {
      if (earliestIndex > 0) {
        segments.push({ text: remaining.slice(0, earliestIndex), isTerm: false });
      }
      segments.push({ text: matchedTerm, isTerm: true, termKey: matchedTerm });
      remaining = remaining.slice(earliestIndex + matchedTerm.length);
    } else {
      segments.push({ text: remaining, isTerm: false });
      remaining = '';
    }
  }
  
  return segments;
}
