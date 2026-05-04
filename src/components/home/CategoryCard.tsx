import { useState } from "react";
import { HelpCircle } from "lucide-react";
import InfoModal from "./InfoModal";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
  infoContent: {
    what: string;
    shows: string;
    teaches: string;
    why: string;
  };
  delay?: string;
}

const CategoryCard = ({ title, description, image, onClick, infoContent, delay = "" }: CategoryCardProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div
        className={`relative bg-card rounded-xl gold-border card-hover cursor-pointer overflow-hidden animate-fade-in-up ${delay}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-pattern opacity-10" />
        <div className="relative z-10">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-heading font-bold text-forest">{title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(true);
                }}
                className="text-gold hover:text-gold-dark transition-colors flex-shrink-0"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          </div>
          <div className="px-4 pb-4 flex justify-center">
            <img
              src={image}
              alt={title}
              className="w-full max-h-48 object-contain"
              loading="lazy"
            />
          </div>
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
