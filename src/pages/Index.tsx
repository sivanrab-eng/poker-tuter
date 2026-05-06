import { useNavigate } from "react-router-dom";
import { trackLessonStart, trackPracticeStart } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import HeroSection from "@/components/home/HeroSection";
import CategoryCard from "@/components/home/CategoryCard";
import theoryPyramid from "@/assets/theory-pyramid.png";
import guidedPlay from "@/assets/guided-play.png";
import visualTraining from "@/assets/visual-training.png";
import probability from "@/assets/probability.png";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const sections = [
    {
      id: "theory",
      title: t("section.theory.title"),
      description: t("section.theory.desc"),
      image: theoryPyramid,
      route: "/lessons",
      info: {
        what: t("section.theory.info.what"),
        shows: t("section.theory.info.shows"),
        teaches: t("section.theory.info.teaches"),
        why: t("section.theory.info.why"),
      },
    },
    {
      id: "guided",
      title: t("section.guided.title"),
      description: t("section.guided.desc"),
      subtitle: t("section.guided.subtitle"),
      image: guidedPlay,
      route: "/guided",
      info: {
        what: t("section.guided.info.what"),
        shows: t("section.guided.info.shows"),
        teaches: t("section.guided.info.teaches"),
        why: t("section.guided.info.why"),
      },
    },
    {
      id: "visual",
      title: t("section.visual.title"),
      description: t("section.visual.desc"),
      image: visualTraining,
      route: "/quiz",
      info: {
        what: t("section.visual.info.what"),
        shows: t("section.visual.info.shows"),
        teaches: t("section.visual.info.teaches"),
        why: t("section.visual.info.why"),
      },
    },
    {
      id: "probability",
      title: t("section.probability.title"),
      description: t("section.probability.desc"),
      image: probability,
      route: "/probability",
      info: {
        what: t("section.probability.info.what"),
        shows: t("section.probability.info.shows"),
        teaches: t("section.probability.info.teaches"),
        why: t("section.probability.info.why"),
      },
    },
  ];

  const arenaItems = [
    {
      title: t("arena.free.title"),
      description: t("arena.free.desc"),
      route: "/practice",
    },
    {
      title: t("arena.multi.title"),
      description: t("arena.multi.desc"),
      route: "/multiplayer",
    },
    {
      title: t("arena.bot.title"),
      description: t("arena.bot.desc"),
      route: "/bot-battle",
    },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <HeroSection />

      <main className="flex-1 max-w-lg mx-auto w-full px-3 flex flex-col justify-between gap-2 pb-3 overflow-hidden">
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

        <div className="relative bg-card rounded-lg gold-border card-hover overflow-visible">
          <div className="absolute inset-0 bg-pattern opacity-5 rounded-lg" />
          <div className="relative z-10 py-2 px-3 border-b border-border">
            <h2 className="text-sm font-heading font-bold text-primary text-center">
              {t("arena.title")}
            </h2>
          </div>
          <div className="relative z-10 grid grid-cols-3 divide-x divide-border">
            {arenaItems.map((item) => (
              <button
                key={item.title}
                onClick={() => { trackPracticeStart(item.title); navigate(item.route); }}
                className="py-2.5 px-1.5 text-center hover:bg-muted transition-colors"
              >
                <h4 className="text-[11px] font-heading font-bold text-primary mb-1 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[9px] text-muted-foreground leading-tight break-words">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
