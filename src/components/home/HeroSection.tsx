import { useState, useEffect } from "react";
import { Share2, Download, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const HeroSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { lang, setLang, t } = useI18n();

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
      navigator.share({ title: t("hero.title"), url: window.location.href });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(t("hero.title") + " - " + window.location.href)}`);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast({ title: t("hero.install.toast") });
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast({
          title: t("hero.install.ios.title"),
          description: t("hero.install.ios.desc"),
          duration: 6000,
        });
      } else {
        toast({
          title: t("hero.install.android.title"),
          description: t("hero.install.android.desc"),
          duration: 6000,
        });
      }
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "he" : "en");
  };

  return (
    <header className="relative py-3 px-4 text-center">
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="relative z-10 flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-primary">{t("hero.title")}</h1>
        <div className="flex gap-2 items-center">
          <Button
            variant="gold-outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-bold gap-1.5"
            onClick={toggleLang}
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "עב" : "EN"}
          </Button>
          <Button variant="gold-outline" size="sm" className="h-8 px-2 text-xs" onClick={handleShare}>
            <Share2 className="h-3 w-3" />
            {t("hero.share")}
          </Button>
          <Button variant="gold-outline" size="sm" className="h-8 px-2 text-xs" onClick={handleInstall}>
            <Download className="h-3 w-3" />
            {t("hero.install")}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
