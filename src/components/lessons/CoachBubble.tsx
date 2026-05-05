import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import coachAvatar from "@/assets/coach-avatar.png";

interface CoachBubbleProps {
  tip: string;
  label?: string;
}

const CoachBubble = ({ tip, label = "טיפ מהמאמן" }: CoachBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-3">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary rounded-full px-4 py-2 transition-all group w-full"
        >
          <img src={coachAvatar} alt="מאמן" className="w-8 h-8 rounded-full flex-shrink-0" />
          <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-xs text-primary font-medium">{label}</span>
          <span className="text-[10px] text-muted-foreground mr-auto">לחצו לפתיחה</span>
        </button>
      ) : (
        <div className="relative bg-secondary/60 border border-primary/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 left-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <img src={coachAvatar} alt="מאמן" className="w-10 h-10 rounded-full flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary mb-1">{label}</p>
              <p className="text-sm text-foreground leading-relaxed">{tip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachBubble;
