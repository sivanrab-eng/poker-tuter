import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "he";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Hero
    "hero.title": "Master Poker",
    "hero.share": "Share",
    "hero.install": "Install",
    "hero.install.toast": "🎉 App added to home screen!",
    "hero.install.ios.title": "Add to Home Screen",
    "hero.install.ios.desc": "Tap the Share button (⬆) in Safari, then 'Add to Home Screen'",
    "hero.install.android.title": "Add to Home Screen",
    "hero.install.android.desc": "Open browser menu (⋮) and choose 'Add to Home Screen' or 'Install App'",

    // Sections
    "section.theory.title": "Theory & Learning",
    "section.theory.desc": "Lessons, hand rankings & glossary.",
    "section.theory.info.what": "The theoretical learning center — lessons, hand rankings, and glossary.",
    "section.theory.info.shows": "4 graded lessons, 9 hand combinations, and a comprehensive glossary.",
    "section.theory.info.teaches": "The basics of Texas Hold'em — rules, concepts, and rankings.",
    "section.theory.info.why": "Because without solid theory, there's no chance at the table.",

    "section.guided.title": "Learn While Playing",
    "section.guided.desc": "Play vs bot with AI coach, smart analysis & analyst report.",
    "section.guided.subtitle": "Includes analyst report: equity, EV & full analysis",
    "section.guided.info.what": "Guided play vs bot with AI coach + professional analyst report after each hand.",
    "section.guided.info.shows": "Full poker table, smart analysis, and post-hand report with equity, EV, correct decisions.",
    "section.guided.info.teaches": "How to make correct decisions and analyze your game professionally.",
    "section.guided.info.why": "Because the best way to learn is to play, get feedback, and analyze.",

    "section.visual.title": "Visual Lab Training",
    "section.visual.desc": "'Who wins?' & 'What beats what?' — fast recognition.",
    "section.visual.info.what": "Visual quizzes for fast recognition of winning hands.",
    "section.visual.info.shows": "Two hands face to face, combination comparisons and difficulty levels.",
    "section.visual.info.teaches": "Instant recognition of winning hands and priority order.",
    "section.visual.info.why": "Because in a real game there's no time to think — you need to recognize instantly.",

    "section.probability.title": "Poker Probability",
    "section.probability.desc": "Outs, Rule of 4, Pot Odds — practical calculations.",
    "section.probability.info.what": "Math module for practicing probabilities and value calculations.",
    "section.probability.info.shows": "Structured scenarios with step-by-step questions.",
    "section.probability.info.teaches": "How to calculate odds, outs and Pot Odds practically.",
    "section.probability.info.why": "Because poker is also math — and whoever understands it wins.",

    // Arena
    "arena.title": "🎰 Game Arena: Choose Your Setting",
    "arena.free.title": "Free Practice",
    "arena.free.desc": "Vs bot, no pressure",
    "arena.multi.title": "Two Players",
    "arena.multi.desc": "Real-time — live!",
    "arena.bot.title": "Bot Battle",
    "arena.bot.desc": "Aggressive vs conservative",

    // Info modal
    "info.what": "What is it?",
    "info.shows": "What it shows?",
    "info.teaches": "What it teaches?",
    "info.why": "Why it exists?",

    // Placeholder
    "placeholder.back": "Back to menu",
    "placeholder.soon": "Coming soon...",
    "placeholder.free.title": "Free Practice",
    "placeholder.free.desc": "Play vs bot, no pressure",
    "placeholder.multi.title": "Two Players",
    "placeholder.multi.desc": "Live game vs a friend",
    "placeholder.bot.title": "Bot Battle",
    "placeholder.bot.desc": "Aggressive vs conservative — who wins?",
  },
  he: {
    // Hero
    "hero.title": "מאסטר פוקר",
    "hero.share": "שתף",
    "hero.install": "הוסף",
    "hero.install.toast": "🎉 האפליקציה נוספה למסך הבית!",
    "hero.install.ios.title": "הוספה למסך הבית",
    "hero.install.ios.desc": "לחצו על כפתור השיתוף (⬆) בספארי ואז 'הוסף למסך הבית'",
    "hero.install.android.title": "הוספה למסך הבית",
    "hero.install.android.desc": "פתחו את התפריט של הדפדפן (⋮) ובחרו 'הוסף למסך הבית' או 'התקן אפליקציה'",

    // Sections
    "section.theory.title": "תיאוריה ולמידה",
    "section.theory.desc": "שיעורים, דירוג ידיים ומילון מונחים.",
    "section.theory.info.what": "מרכז הלמידה התיאורטי — שיעורים, דירוג ידיים ומילון מונחים.",
    "section.theory.info.shows": "4 שיעורים מדורגים, 9 קומבינציות ידיים, ומילון מקיף.",
    "section.theory.info.teaches": "את הבסיס של טקסס הולדם — חוקים, מושגים, ודירוג.",
    "section.theory.info.why": "כי בלי תיאוריה חזקה, אין סיכוי להצליח בשולחן.",

    "section.guided.title": "לומד תוך כדי משחק",
    "section.guided.desc": "שחק מול בוט עם מאמן AI, ניתוח חכם ודו״ח אנליסט.",
    "section.guided.subtitle": "כולל דו״ח אנליסט: אקוויטי, EV וניתוח מלא",
    "section.guided.info.what": "משחק מודרך מול בוט עם מאמן AI + דו״ח אנליסט מקצועי אחרי כל יד.",
    "section.guided.info.shows": "שולחן פוקר מלא, ניתוח חכם, ובסיום כל יד — דו״ח עם אקוויטי, EV, החלטות נכונות.",
    "section.guided.info.teaches": "איך לקבל החלטות נכונות ולנתח את המשחק שלך בצורה מקצועית.",
    "section.guided.info.why": "כי הדרך הכי טובה ללמוד היא לשחק, לקבל פידבק ולנתח.",

    "section.visual.title": "אימון ויזואלי בתנאי מעבדה",
    "section.visual.desc": "חידוני 'מי מנצח?' ו'מה לוקח מה?' — זיהוי מהיר.",
    "section.visual.info.what": "חידונים ויזואליים לזיהוי מהיר של ידיים מנצחות.",
    "section.visual.info.shows": "שתי ידיים זו מול זו, השוואת קומבינציות ורמת קושי.",
    "section.visual.info.teaches": "זיהוי מיידי של יד מנצחת וסדר עדיפויות.",
    "section.visual.info.why": "כי במשחק אמיתי אין זמן לחשוב — צריך לזהות ברגע.",

    "section.probability.title": "הסתברות פוקר",
    "section.probability.desc": "אאוטס, כלל ה-4, Pot Odds — חישובים מעשיים.",
    "section.probability.info.what": "מודול מתמטי לתרגול הסתברויות וחישובי כדאיות.",
    "section.probability.info.shows": "תרחישים מובנים עם שאלות שלב-אחר-שלב.",
    "section.probability.info.teaches": "איך לחשב סיכויים, אאוטס ו-Pot Odds בצורה מעשית.",
    "section.probability.info.why": "כי פוקר הוא גם מתמטיקה — ומי שמבין אותה מנצח.",

    // Arena
    "arena.title": "🎰 זירת המשחק: בחר את הסביבה שלך",
    "arena.free.title": "תרגול חופשי",
    "arena.free.desc": "נגד בוט, בלי לחץ",
    "arena.multi.title": "משחק לשניים",
    "arena.multi.desc": "בזמן אמת — חי!",
    "arena.bot.title": "קרב בוטים",
    "arena.bot.desc": "תוקפן vs שמרן",

    // Info modal
    "info.what": "מה זה?",
    "info.shows": "מה מראה?",
    "info.teaches": "מה בא ללמד?",
    "info.why": "למה הוא קיים?",

    // Placeholder
    "placeholder.back": "חזרה לתפריט",
    "placeholder.soon": "בקרוב...",
    "placeholder.free.title": "תרגול חופשי",
    "placeholder.free.desc": "משחק מול בוט בלי לחץ",
    "placeholder.multi.title": "משחק לשניים",
    "placeholder.multi.desc": "משחק חי מול חבר",
    "placeholder.bot.title": "קרב בוטים",
    "placeholder.bot.desc": "תוקפן נגד שמרן — מי ינצח?",
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved === "he" || saved === "en") ? saved : "en";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  };

  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = (key: string): string => {
    return translations[lang][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
