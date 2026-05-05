import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lessons } from "@/data/lessonContent";
import CoachBubble from "@/components/lessons/CoachBubble";
import LessonSection, { ExampleBox, TextWithGlossary } from "@/components/lessons/LessonSection";
import { trackLessonStart } from "@/lib/analytics";
import { useEffect } from "react";

const LessonPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const lesson = lessons.find((l) => l.slug === slug);
  const lessonIndex = lessons.findIndex((l) => l.slug === slug);
  const prevLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null;

  useEffect(() => {
    if (lesson) {
      trackLessonStart(lesson.slug);
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background bg-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg mb-4">שיעור לא נמצא</p>
          <Button variant="gold" onClick={() => navigate("/lessons")}>
            חזרה לתיאוריה
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/lessons")} className="text-foreground p-2">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              שיעור {lesson.id} מתוך {lessons.length}
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {lessons.map((l) => (
            <button
              key={l.id}
              onClick={() => navigate(`/lessons/${l.slug}`)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                l.id === lesson.id
                  ? "bg-primary scale-125"
                  : l.id < lesson.id
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Title card */}
        <div className="bg-card rounded-xl gold-border p-5 mb-6 text-center corner-accent">
          <h1 className="text-xl font-heading font-bold text-primary mb-1">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">{lesson.subtitle}</p>
        </div>

        {/* Lesson content */}
        {lesson.sections.map((section, idx) => (
          <div key={idx}>
            <LessonSection title={section.title}>
              {section.paragraphs.map((p, pIdx) => (
                <TextWithGlossary key={pIdx} text={p} />
              ))}
              {section.example && (
                <ExampleBox title={section.example.title}>
                  <TextWithGlossary text={section.example.content} />
                </ExampleBox>
              )}
            </LessonSection>
            {section.coachTip && <CoachBubble tip={section.coachTip} />}
          </div>
        ))}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8 mb-4">
          {prevLesson ? (
            <Button
              variant="gold-outline"
              className="flex-1"
              onClick={() => navigate(`/lessons/${prevLesson.slug}`)}
            >
              <ArrowRight className="h-4 w-4" />
              {prevLesson.title}
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          {nextLesson ? (
            <Button
              variant="gold"
              className="flex-1"
              onClick={() => navigate(`/lessons/${nextLesson.slug}`)}
            >
              {nextLesson.title}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="gold"
              className="flex-1"
              onClick={() => navigate("/lessons")}
            >
              חזרה לתיאוריה
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
