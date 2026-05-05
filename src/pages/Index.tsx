import { useNavigate } from "react-router-dom";
import { trackLessonStart, trackPracticeStart } from "@/lib/analytics";
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
    description: "שיעורים, דירוג ידיים ומילון מונחים.",
    image: theoryPyramid,
    route: "/lessons",
    info: {
      what: "מרכז הלמידה התיאורטי — שיעורים, דירוג ידיים ומילון מונחים.",
      shows: "4 שיעורים מדורגים, 9 קומבינציות ידיים, ומילון מקיף.",
      teaches: "את הבסיס של טקסס הולדם — חוקים, מושגים, ודירוג.",
      why: "כי בלי תיאוריה חזקה, אין סיכוי להצליח בשולחן.",
    },
  },
  {
    id: "guided",
    title: "לומד תוך כדי משחק",
    description: "שחק מול בוט עם מאמן AI, ניתוח חכם ודו״ח אנליסט.",
    subtitle: "כולל דו״ח אנליסט: אקוויטי, EV וניתוח מלא",
    image: guidedPlay,
    route: "/guided",
    info: {
      what: "משחק מודרך מול בוט עם מאמן AI + דו״ח אנליסט מקצועי אחרי כל יד.",
      shows: "שולחן פוקר מלא, ניתוח חכם, ובסיום כל יד — דו״ח עם אקוויטי, EV, החלטות נכונות.",
      teaches: "איך לקבל החלטות נכונות ולנתח את המשחק שלך בצורה מקצועית.",
      why: "כי הדרך הכי טובה ללמוד היא לשחק, לקבל פידבק ולנתח.",
    },
  },
  {
    id: "visual",
    title: "אימון ויזואלי בתנאי מעבדה",
    description: "חידוני 'מי מנצח?' ו'מה לוקח מה?' — זיהוי מהיר.",
    image: visualTraining,
    route: "/quiz",
    info: {
      what: "חידונים ויזואליים לזיהוי מהיר של ידיים מנצחות.",
      shows: "שתי ידיים זו מול זו, השוואת קומבינציות ורמת קושי.",
      teaches: "זיהוי מיידי של יד מנצחת וסדר עדיפויות.",
      why: "כי במשחק אמיתי אין זמן לחשוב — צריך לזהות ברגע.",
    },
  },
  {
    id: "probability",
    title: "הסתברות פוקר",
    description: "אאוטס, כלל ה-4, Pot Odds — חישובים מעשיים.",
    image: probability,
    route: "/probability",
    info: {
      what: "מודול מתמטי לתרגול הסתברויות וחישובי כדאיות.",
      shows: "תרחישים מובנים עם שאלות שלב-אחר-שלב.",
      teaches: "איך לחשב סיכויים, אאוטס ו-Pot Odds בצורה מעשית.",
      why: "כי פוקר הוא גם מתמטיקה — ומי שמבין אותה מנצח.",
    },
  },
];

const arenaItems = [
  {
    title: "תרגול חופשי",
    description: "נגד בוט, בלי לחץ",
    route: "/practice",
  },
  {
    title: "משחק לשניים",
    description: "בזמן אמת — חי!",
    route: "/multiplayer",
  },
  {
    title: "קרב בוטים",
    description: "תוקפן vs שמרן",
    route: "/bot-battle",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <HeroSection />

      <main className="flex-1 max-w-lg mx-auto w-full px-3 flex flex-col justify-between gap-2 pb-3 overflow-hidden">
        {/* Main category cards */}
        <div className="flex flex-col gap-2 flex-1 justify-evenly">
          {sections.map((section) => (
            <CategoryCard
              key={section.id}
              title={section.title}
              description={section.description}
              subtitle={section.subtitle}
              image={section.image}
              onClick={() => { trackLessonStart(section.id); navigate(section.route); }}
              infoContent={section.info}
            />
          ))}
        </div>

        {/* Arena section - same style as cards above */}
        <div className="relative bg-card rounded-lg gold-border card-hover overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-5" />
          <div className="relative z-10 py-2 px-3 border-b border-border">
            <h2 className="text-sm font-heading font-bold text-primary text-center">
              🎰 זירת המשחק: בחר את הסביבה שלך
            </h2>
          </div>
          <div className="relative z-10 grid grid-cols-3" style={{ direction: 'ltr' }}>
            {arenaItems.map((item) => (
              <button
                key={item.title}
                onClick={() => { trackPracticeStart(item.title); navigate(item.route); }}
                className="py-2.5 px-2 text-center hover:bg-muted transition-colors"
              >
                <h4 className="text-xs font-heading font-bold text-primary mb-1">
                  {item.title}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-tight">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
