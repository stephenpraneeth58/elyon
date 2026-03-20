import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import { AppProvider, useAppContext } from "./context/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCompletedDates, useUserProfile } from "./hooks/useQueries";
import { calculateStreak } from "./lib/assistant";
import AuthScreen from "./screens/AuthScreen";
import CalendarScreen from "./screens/CalendarScreen";
import FocusScreen from "./screens/FocusScreen";
import HomeScreen from "./screens/HomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import ProgressScreen from "./screens/ProgressScreen";

function AppShell() {
  const [tab, setTab] = useState<Tab>("home");
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: completedDates = [] } = useCompletedDates();
  const { setUserName, setStreak, setCompletedDates } = useAppContext();
  const [onboarded, setOnboarded] = useState(false);

  const isLoggedIn = !!identity;
  const hasProfile = !!profile;
  const showOnboarding =
    isLoggedIn && !profileLoading && !hasProfile && !onboarded;

  useEffect(() => {
    if (profile?.name) {
      setUserName(profile.name);
      setOnboarded(true);
    }
  }, [profile, setUserName]);

  useEffect(() => {
    if (completedDates.length > 0) {
      setCompletedDates(completedDates);
      setStreak(calculateStreak(completedDates));
    }
  }, [completedDates, setCompletedDates, setStreak]);

  if (isInitializing || (isLoggedIn && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <AuthScreen />;
  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={(name) => {
          setUserName(name);
          setOnboarded(true);
        }}
      />
    );
  }

  const screens: Record<Tab, React.ReactNode> = {
    home: <HomeScreen onNavigate={setTab} />,
    calendar: <CalendarScreen />,
    focus: <FocusScreen />,
    progress: <ProgressScreen />,
  };

  return (
    <div className="relative w-full max-w-[430px] mx-auto min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {screens[tab]}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={tab} onTabChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-black flex items-start justify-center">
        <AppShell />
      </div>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.22 0 0)",
            color: "white",
          },
        }}
      />
    </AppProvider>
  );
}
