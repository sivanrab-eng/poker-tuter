import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import CategoryCard from "@/components/home/CategoryCard";
import theoryPyramid from "@/assets/theory-pyramid.png";
import guidedPlay from "@/assets/guided-play.png";
import visualTraining from "@/assets/visual-training.png";
import probability from "@/assets/probability.png";

const sections = [
  {
    id: "theory",
    title: "תיאוריה ולמידה",
    description: "שיעורים מדורגים, דירוג ידיים וכל מה שצריך לדעת לפני שמתחילים.",
    image: theoryPyramid,
    route: "/lessons",
    info: {
      what: "מרכז הלמידה התיאורטי של מאסטר פוקר — שיעורים, דירוג ידיים ומילון מונחים.",
      shows: "4 שיעורים מדורגים, 9 קומבינציות ידיים מהחזק לחלש, ומילון מקיף.",
      teaches: "את הבסיס של טקסס הולדם — חוקים, מושגים, ודירוג ידיים.",
      why: "כי בלי תיאוריה חזקה, אין סיכוי להצליח בשולחן.",
    },
  },
  {
    id: "guided",
    title: "לומד תוך כדי משחק",
    description: "שחק מול בוט עם מאמן AI שמסביר לך כל צעד בזמן אמת.",
    image: guidedPlay,
    route: "/guided",
    info: {
      what: "משחק מודרך מול בוט עם ליווי מאמן AI אישי.",
      shows: "שולחן פוקר מלא עם קלפים, צ'יפים, סיר וניתוח חכם.",
      teaches: "איך לקבל החלטות נכונות בכל שלב של היד.",
      why: "כי הדרך הכי טובה ללמוד היא לשחק ולקבל פידבק מיידי.",
    },
  },
  {
    id: "visual",
    title: "אימון ויזואלי בתנאי מעבדה",
    description: "חידוני 'מי מנצח?' ו'מה לוקח מה?' — תרגול זיהוי מהיר של ידיים.",
    image: visualTraining,
    route: "/quiz",
    info: {
      what: "חידונים ויזואליים אינטראקטיביים לזיהוי מהיר של ידיים מנצחות.",
      shows: "שתי ידיים זו מול זו, השוואת קומבינציות ורמת קושי מתכווננת.",
      teaches: "זיהוי מיידי של יד מנצחת וסדר עדיפויות בין ידיים.",
      why: "כי בזמן משחק אמיתי אין זמן לחשוב — צריך לזהות ברגע.",
    },
  },
  {
    id: "probability",
    title: "הסתברות פוקר: המתמטיקה שמאחורי הקלפים",
    description: "אאוטס, כלל ה-4, Pot Odds — תרגול חישובים מעשיים.",
    image: probability,
    route: "/probability",
    info: {
      what: "מודול מתמטי לתרגול הסתברויות וחישובי כדאיות.",
      shows: "תרחישים מובנים עם שאלות שלב-אחר-שלב.",
      teaches: "איך לחשב סיכויים, אאוטס ו-Pot Odds בצורה מעשית.",
      why: "כי פוקר הוא גם מתמטיקה — ומי שמבין אותה מנצח יותר.",
    },
  },
];

const arenaItems = [
  {
    title: "תרגול חופשי",
    description: "נגד בוט, בלי לחץ",
    details: "מטרה: יישום בסיסי",
    route: "/practice",
  },
  {
    title: "משחק לשניים — חי!",
    description: "שני מכשירים, בזמן אמת",
    details: "מטרה: התמודדות אנושית",
    route: "/multiplayer",
  },
  {
    title: "קרב בוטים",
    description: "תוקפן vs שמרן",
    details: "מטרה: למידה פסיבית מאלגוריתמים",
    route: "/bot-battle",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="max-w-lg mx-auto px-4 pb-12 space-y-8">
        {/* Main category cards */}
        {sections.map((section, i) => (
          <CategoryCard
            key={section.id}
            title={section.title}
            description={section.description}
            image={section.image}
            onClick={() => navigate(section.route)}
            infoContent={section.info}
            delay={`delay-${(i + 1) * 100}`}
          />
        ))}

        {/* Arena section */}
        <div className="section-divider mx-auto max-w-xs" />

        <div className="animate-fade-in-up delay-400">
          <h2 className="text-2xl font-heading font-bold text-forest text-center mb-6">
            זירת המשחק: בחר את הסביבה שלך
          </h2>

          <div className="bg-card rounded-xl gold-border overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-border">
              {arenaItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => navigate(item.route)}
                  className="p-4 text-center hover:bg-cream-dark transition-colors"
                >
                  <h4 className="text-sm font-heading font-bold text-forest mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                  <p className="text-xs text-gold-dark font-medium">{item.details}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyst report teaser */}
        <div className="section-divider mx-auto max-w-xs" />

        <div className="bg-card rounded-xl gold-border p-6 text-center corner-accent animate-fade-in-up">
          <h3 className="text-xl font-heading font-bold text-forest mb-2">דו״ח אנליסט</h3>
          <p className="text-sm text-muted-foreground">
            ניתוח מקצועי של כל יד — אקוויטי, EV, החלטות נכונות והסברים מפורטים.
          </p>
          <p className="text-xs text-gold-dark mt-2">זמין אחרי כל יד במשחק מודרך</p>
        </div>

        {/* Footer */}
        <footer className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            © 2024 מאסטר פוקר. כל הזכויות שמורות.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
