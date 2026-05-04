import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import GuidedGame from "./pages/GuidedGame.tsx";
import NotFound from "./pages/NotFound.tsx";
import PlaceholderPage from "./components/PlaceholderPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lessons" element={<PlaceholderPage title="שיעורים" description="4 שיעורים מדורגים ללימוד יסודות הפוקר" />} />
          <Route path="/hand-rankings" element={<PlaceholderPage title="דירוג ידיים" description="כל 9 הקומבינציות מהחזק לחלש" />} />
          <Route path="/glossary" element={<PlaceholderPage title="מילון מונחים" description="כל המושגים שצריך לדעת" />} />
          <Route path="/guided" element={<GuidedGame />} />
          <Route path="/quiz" element={<PlaceholderPage title="אימון ויזואלי" description="חידוני מי מנצח ומה לוקח מה" />} />
          <Route path="/probability" element={<PlaceholderPage title="הסתברות פוקר" description="אאוטס, כלל ה-4, Pot Odds" />} />
          <Route path="/practice" element={<PlaceholderPage title="תרגול חופשי" description="משחק מול בוט בלי לחץ" />} />
          <Route path="/multiplayer" element={<PlaceholderPage title="משחק לשניים" description="משחק חי מול חבר" />} />
          <Route path="/bot-battle" element={<PlaceholderPage title="קרב בוטים" description="תוקפן נגד שמרן — מי ינצח?" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
