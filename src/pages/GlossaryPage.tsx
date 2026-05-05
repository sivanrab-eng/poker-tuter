import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Languages, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { glossary } from "@/lib/pokerGlossary";

const GlossaryPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const terms = Object.values(glossary).filter(
    (t) =>
      t.term.includes(search) ||
      t.explanation.includes(search)
  );

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/lessons")} className="text-foreground p-2">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <Languages className="h-5 w-5" />
            מילון מונחים
          </h1>
          <div className="w-9" />
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="חיפוש מונח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Terms list */}
        <div className="flex flex-col gap-2.5">
          {terms.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">לא נמצאו תוצאות</p>
          )}
          {terms.map((term) => (
            <div
              key={term.term}
              className="bg-card rounded-xl gold-border p-4"
            >
              <h3 className="text-sm font-heading font-bold text-primary mb-1">{term.term}</h3>
              <p className="text-xs text-foreground leading-relaxed">{term.explanation}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-[10px] mt-6">
          {Object.keys(glossary).length} מונחים
        </p>
      </div>
    </div>
  );
};

export default GlossaryPage;
