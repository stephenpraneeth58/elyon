import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Goal, Task } from "../backend.d";

interface AppContextValue {
  activeGoal: Goal | null;
  setActiveGoal: (goal: Goal | null) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  todayTasks: Task[];
  setTodayTasks: (tasks: Task[]) => void;
  userName: string;
  setUserName: (name: string) => void;
  streak: number;
  setStreak: (n: number) => void;
  completedDates: string[];
  setCompletedDates: (dates: string[]) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [userName, setUserName] = useState("");
  const [streak, setStreak] = useState(0);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeGoal,
        setActiveGoal,
        goals,
        setGoals,
        todayTasks,
        setTodayTasks,
        userName,
        setUserName,
        streak,
        setStreak,
        completedDates,
        setCompletedDates,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
