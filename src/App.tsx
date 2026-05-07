import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index.tsx";
import GuidedGame from "./pages/GuidedGame.tsx";
import TheoryLearning from "./pages/TheoryLearning.tsx";
import LessonPage from "./pages/LessonPage.tsx";
import HandRankingsPage from "./pages/HandRankingsPage.tsx";
import GlossaryPage from "./pages/GlossaryPage.tsx";
import VisualQuizPage from "./pages/VisualQuizPage.tsx";
import ProbabilityPage from "./pages/ProbabilityPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import BotBattle from "./pages/BotBattle.tsx";
import TwoPlayer from "./pages/TwoPlayer.tsx";
import PlaceholderPage from "./components/PlaceholderPage.tsx";
import { useI18n } from "@/lib/i18n";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { t } = useI18n();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/lessons" element={<TheoryLearning />} />
      <Route path="/lessons/:slug" element={<LessonPage />} />
      <Route path="/hand-rankings" element={<HandRankingsPage />} />
      <Route path="/glossary" element={<GlossaryPage />} />
      <Route path="/guided" element={<GuidedGame />} />
      <Route path="/quiz" element={<VisualQuizPage />} />
      <Route path="/probability" element={<ProbabilityPage />} />
      <Route path="/practice" element={<PlaceholderPage title={t("placeholder.free.title")} description={t("placeholder.free.desc")} />} />
      <Route path="/multiplayer" element={<TwoPlayer />} />
      <Route path="/bot-battle" element={<BotBattle />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
