import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "מאסטר פוקר", url: window.location.href });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent("מאסטר פוקר - " + window.location.href)}`);
    }
  };

  return (
    <header className="relative py-8 px-4 text-center">
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="relative z-10">
        <div className="flex justify-center gap-3 mb-6">
          <Button variant="gold-outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            שתף
          </Button>
          <Button variant="gold-outline" size="sm">
            <Download className="h-4 w-4" />
            שמור
          </Button>
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-forest mb-3">
          מאסטר פוקר
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          מהיסודות ועד לניצחון — למד טקסס הולדם כמו מקצוען
        </p>
        <div className="section-divider mt-8 mx-auto max-w-xs" />
      </div>
    </header>
  );
};

export default HeroSection;
