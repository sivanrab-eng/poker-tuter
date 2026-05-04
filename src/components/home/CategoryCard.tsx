import { useState } from "react";
import { HelpCircle } from "lucide-react";
import InfoModal from "./InfoModal";

interface CategoryCardProps {
  title: string;
  description: string;
  subtitle?: string;
  image: string;
  onClick: () => void;
  infoContent: {
    what: string;
    shows: string;
    teaches: string;
    why: string;
  };
}

const CategoryCard = ({ title, description, subtitle, image, onClick, infoContent }: CategoryCardProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div
        className="relative bg-card rounded-lg gold-border card-hover cursor-pointer overflow-hidden flex items-center gap-3 p-3"
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-pattern opacity-5" />
        <img
          src={image}
          alt={title}
          className="relative z-10 w-16 h-16 object-contain flex-shrink-0"
          loading="lazy"
        />
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex justify-between items-start gap-1">
            <h3 className="text-sm font-heading font-bold text-forest leading-tight">{title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true);
              }}
              className="text-gold hover:text-gold-dark transition-colors flex-shrink-0"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
          {subtitle && (
            <p className="text-xs text-gold-dark font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title={title}
        content={infoContent}
      />
    </>
  );
};

export default CategoryCard;
