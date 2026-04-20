import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import PlaceholderPage from "./pages/PlaceholderPage.tsx";
import HousesPage from "./pages/HousesPage.tsx";
import GuidedToursPage from "./pages/GuidedToursPage.tsx";
import ExperiencePackagesPage from "./pages/ExperiencePackagesPage.tsx";
import BookingPage from "./pages/BookingPage.tsx";
import MapPage from "./pages/MapPage.tsx";
import GradingSystemPage from "./pages/GradingSystemPage.tsx";
import HistoryPage from "./pages/HistoryPage.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import ExperienceWalksPage from "./pages/ExperienceWalksPage.tsx";
import WalkNowPage from "./pages/WalkNowPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import CoworkingBookingPage from "./pages/CoworkingBookingPage.tsx";
import MyBookingsPage from "./pages/MyBookingsPage.tsx";

const queryClient = new QueryClient();

const placeholderRoutes = [
  { path: "/photo-archive", title: "Photo Archive", description: "Visual documentation — old vs current photographs." },
  { path: "/about", title: "About", description: "Grading system, heritage logic & thesis interpretation." },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/guided-tours" element={<GuidedToursPage />} />
          <Route path="/plan-walk" element={<ExperiencePackagesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/grading-system" element={<GradingSystemPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/experience-walks" element={<ExperienceWalksPage />} />
          <Route path="/walk-now" element={<WalkNowPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/book-coworking" element={<CoworkingBookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          {placeholderRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={<PlaceholderPage title={r.title} description={r.description} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
