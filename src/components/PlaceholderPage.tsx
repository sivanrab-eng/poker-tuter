import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowRight className="h-4 w-4" />
          חזרה לתפריט
        </Button>
        <div className="bg-card rounded-xl gold-border p-8 text-center corner-accent">
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-gold-dark mt-4">בקרוב...</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
