import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const Arrow = lang === "he" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-foreground">
          <Arrow className="h-4 w-4" />
          {t("placeholder.back")}
        </Button>
        <div className="bg-card rounded-xl gold-border p-8 text-center corner-accent">
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-primary/60 mt-4">{t("placeholder.soon")}</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
