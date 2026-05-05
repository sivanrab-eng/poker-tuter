import { useState, useEffect } from "react";
import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const HeroSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "מאסטר פוקר", url: window.location.href });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent("מאסטר פוקר - " + window.location.href)}`);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast({ title: "🎉 האפליקציה נוספה למסך הבית!" });
      }
      setDeferredPrompt(null);
    } else {
      // iOS or already installed
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast({
          title: "הוספה למסך הבית",
          description: "לחצו על כפתור השיתוף (⬆) בספארי ואז 'הוסף למסך הבית'",
          duration: 6000,
        });
      } else {
        toast({
          title: "הוספה למסך הבית",
          description: "פתחו את התפריט של הדפדפן (⋮) ובחרו 'הוסף למסך הבית' או 'התקן אפליקציה'",
          duration: 6000,
        });
      }
    }
  };

  return (
    <header className="relative py-3 px-4 text-center">
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="relative z-10 flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-primary">מאסטר פוקר</h1>
        <div className="flex gap-2">
          <Button variant="gold-outline" size="sm" className="h-8 px-2 text-xs" onClick={handleShare}>
            <Share2 className="h-3 w-3" />
            שתף
          </Button>
          <Button variant="gold-outline" size="sm" className="h-8 px-2 text-xs" onClick={handleInstall}>
            <Download className="h-3 w-3" />
            הוסף
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
