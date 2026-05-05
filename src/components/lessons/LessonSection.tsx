import GlossaryText from "@/components/poker/GlossaryText";

interface LessonSectionProps {
  title: string;
  children: React.ReactNode;
}

const LessonSection = ({ title, children }: LessonSectionProps) => (
  <section className="mb-6">
    <h2 className="text-lg font-heading font-bold text-primary mb-3 border-b border-border pb-2">
      {title}
    </h2>
    <div className="space-y-3 text-sm text-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

interface ExampleBoxProps {
  title?: string;
  children: React.ReactNode;
}

export const ExampleBox = ({ title = "דוגמה", children }: ExampleBoxProps) => (
  <div className="bg-muted/50 border border-primary/15 rounded-lg p-3 my-2">
    <p className="text-xs font-bold text-primary mb-1">💡 {title}</p>
    <div className="text-sm text-foreground leading-relaxed">{children}</div>
  </div>
);

interface TextWithGlossaryProps {
  text: string;
}

export const TextWithGlossary = ({ text }: TextWithGlossaryProps) => (
  <GlossaryText text={text} className="block" />
);

export default LessonSection;
