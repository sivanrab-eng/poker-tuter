import { useState } from 'react';
import { glossary, parseTextWithTerms, type TextSegment } from '@/lib/pokerGlossary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GlossaryTextProps {
  text: string;
  className?: string;
}

const GlossaryText = ({ text, className = '' }: GlossaryTextProps) => {
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const segments = parseTextWithTerms(text);

  return (
    <>
      <span className={className}>
        {segments.map((seg, i) =>
          seg.isTerm ? (
            <button
              key={i}
              onClick={() => setOpenTerm(seg.termKey!)}
              className="text-primary underline underline-offset-2 decoration-primary/50 hover:decoration-primary font-bold transition-colors cursor-pointer mx-0.5"
            >
              {seg.text}
            </button>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </span>

      <Dialog open={!!openTerm} onOpenChange={() => setOpenTerm(null)}>
        <DialogContent className="bg-card border-primary/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-primary font-heading text-right">
              {openTerm && glossary[openTerm]?.term}
            </DialogTitle>
          </DialogHeader>
          <p className="text-foreground text-sm leading-relaxed text-right">
            {openTerm && glossary[openTerm]?.explanation}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlossaryText;
