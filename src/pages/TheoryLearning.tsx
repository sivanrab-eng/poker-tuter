import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Trophy, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackLessonStart } from "@/lib/analytics";
import theoryLessons from "@/assets/theory-lessons.png";
import handRankingsIcon from "@/assets/hand-rankings-icon.png";
import glossaryIcon from "@/assets/glossary-icon.png";

const subCategories = [
  {
    id: "lessons",
    title: "שיעורים",
    description: "4 שיעורים מדורגים ללימוד יסודות הפוקר — מהחוקים הבסיסיים ועד אסטרטגיה.",
    subtitle: "מתחיל → מתקדם",
    image: theoryLessons,
    route: "/lessons/lesson-1",
    icon: BookOpen,
  },
  {
    id: "hand-rankings",
    title: "דירוג ידיים",
    description: "כל 9 הקומבינציות מהחזק לחלש — עם דוגמאות ויזואליות.",
    subtitle: "Royal Flush → High Card",
    image: handRankingsIcon,
    route: "/hand-rankings",
    icon: Trophy,
  },
  {
    id: "glossary",
    title: "מילון מונחים",
    description: "כל המושגים שצריך לדעת — בעברית פשוטה עם הסבר באנגלית.",
    subtitle: "20+ מונחים",
    image: glossaryIcon,
    route: "/glossary",
    icon: Languages,
  },
];

const TheoryLearning = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground p-2">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-heading font-bold text-primary">תיאוריה ולמידה</h1>
          <div className="w-9" /> {/* spacer for centering */}
        </div>

        {/* Intro text */}
        <p className="text-center text-muted-foreground text-sm mb-6 leading-relaxed">
          הבסיס לכל שחקן פוקר טוב. למדו את החוקים, הכירו את הידיים, ודברו את השפה.
        </p>

        {/* Sub-category cards */}
        <div className="flex flex-col gap-4">
          {subCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  trackLessonStart(cat.id);
                  navigate(cat.route);
                }}
                className="relative bg-card rounded-xl gold-border card-hover overflow-hidden flex items-center gap-4 p-4 text-right w-full transition-all"
              >
                <div className="absolute inset-0 bg-pattern opacity-5" />
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="relative z-10 w-20 h-20 object-contain flex-shrink-0"
                  loading="lazy"
                  width={512}
                  height={512}
                />
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <h3 className="text-base font-heading font-bold text-primary">{cat.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  {cat.subtitle && (
                    <p className="text-xs text-primary/70 font-medium mt-1">{cat.subtitle}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TheoryLearning;
