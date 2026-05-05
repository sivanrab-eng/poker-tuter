import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: {
    what: string;
    shows: string;
    teaches: string;
    why: string;
  };
}

const InfoModal = ({ isOpen, onClose, title, content }: InfoModalProps) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl p-6 max-w-sm w-full gold-border corner-accent shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-heading font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-bold text-primary">{t("info.what")}</span>
            <p className="text-muted-foreground mt-1">{content.what}</p>
          </div>
          <div>
            <span className="font-bold text-primary">{t("info.shows")}</span>
            <p className="text-muted-foreground mt-1">{content.shows}</p>
          </div>
          <div>
            <span className="font-bold text-primary">{t("info.teaches")}</span>
            <p className="text-muted-foreground mt-1">{content.teaches}</p>
          </div>
          <div>
            <span className="font-bold text-primary">{t("info.why")}</span>
            <p className="text-muted-foreground mt-1">{content.why}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
