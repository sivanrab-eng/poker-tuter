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
    <header className="relative py-3 px-4 text-center">
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="relative z-10 flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-forest">מאסטר פוקר</h1>
        <div className="flex gap-2">
          <Button variant="gold-outline" size="sm" className="h-8 px-2 text-xs" onClick={handleShare}>
            <Share2 className="h-3 w-3" />
            שתף
          </Button>
          <Button variant="gold-outline" size="sm" className="h-8 px-2 text-xs">
            <Download className="h-3 w-3" />
            שמור
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
