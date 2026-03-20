import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pause, Play, RotateCcw, Settings, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useGoals } from "../hooks/useQueries";
import { getAssistantMessage, getDaysLeftInYear } from "../lib/assistant";

type Phase = "work" | "break";

export default function FocusScreen() {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [totalSessions] = useState(4);
  const [session, setSession] = useState(1);
  const [phase, setPhase] = useState<Phase>("work");
  const [seconds, setSeconds] = useState(workMins * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempWork, setTempWork] = useState(String(workMins));
  const [tempBreak, setTempBreak] = useState(String(breakMins));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { activeGoal, goals, streak } = useAppContext();
  const { data: fetchedGoals = [] } = useGoals();
  const allGoals = fetchedGoals.length > 0 ? fetchedGoals : goals;
  const currentGoal = activeGoal ?? allGoals[0] ?? null;
  const daysLeft = getDaysLeftInYear();

  const totalSeconds = phase === "work" ? workMins * 60 : breakMins * 60;
  const progress = 1 - seconds / totalSeconds;
  const circumference = 2 * Math.PI * 88;
  const dashOffset = circumference * (1 - progress);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(workMins * 60);
    setPhase("work");
    setSession(1);
  }, [workMins]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (phase === "work") {
            setPhase("break");
            return breakMins * 60;
          }
          setSession((s) => Math.min(s + 1, totalSessions));
          setPhase("work");
          return workMins * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, workMins, breakMins, totalSessions]);

  const handleSaveSettings = () => {
    const w = Math.max(1, Math.min(90, Number.parseInt(tempWork) || 25));
    const b = Math.max(1, Math.min(30, Number.parseInt(tempBreak) || 5));
    setWorkMins(w);
    setBreakMins(b);
    setSeconds(w * 60);
    setPhase("work");
    setRunning(false);
    setShowSettings(false);
  };

  const assistantMessage = getAssistantMessage(
    running ? "during_focus" : "before_focus",
    currentGoal?.title ?? "",
    currentGoal?.reason ?? "",
    streak,
    daysLeft,
  );

  return (
    <div
      className="flex flex-col items-center min-h-screen bg-background pb-24 px-5"
      data-ocid="focus.page"
    >
      <div className="w-full flex items-center justify-between pt-12 pb-6">
        <h1 className="text-xl font-semibold">Focus</h1>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-muted-foreground"
          data-ocid="focus.settings_button"
        >
          <Settings size={14} />
        </button>
      </div>

      {currentGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full bg-surface rounded-2xl p-4 border border-border mb-8 text-center"
          data-ocid="focus.card"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Current Goal
          </p>
          <p className="text-sm font-semibold">{currentGoal.title}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            "{currentGoal.reason}"
          </p>
        </motion.div>
      )}

      <div className="relative flex items-center justify-center mb-8">
        <svg
          width="200"
          height="200"
          className="-rotate-90"
          role="img"
          aria-label="Pomodoro timer"
        >
          <title>Pomodoro Timer</title>
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="oklch(0.18 0 0)"
            strokeWidth="6"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="oklch(0.76 0.18 76)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <p
            className={`text-4xl font-bold tabular-nums ${
              phase === "work" ? "text-foreground" : "text-gold"
            }`}
          >
            {formatTime(seconds)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            {phase === "work" ? "Focus" : "Break"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Session {session} of {totalSessions}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={reset}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="focus.secondary_button"
          aria-label="Reset"
        >
          <RotateCcw size={16} />
        </button>

        <Button
          onClick={() => setRunning((r) => !r)}
          className="w-20 h-20 rounded-full bg-gold text-background hover:opacity-90 transition-opacity flex items-center justify-center"
          data-ocid="focus.primary_button"
        >
          {running ? (
            <Pause size={28} fill="currentColor" />
          ) : (
            <Play size={28} fill="currentColor" />
          )}
        </Button>

        <div className="w-11 h-11" />
      </div>

      <div
        className="w-full bg-surface rounded-2xl p-4 border border-border flex items-start gap-2.5"
        data-ocid="focus.panel"
      >
        <Sparkles size={14} className="text-gold mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {assistantMessage}
        </p>
      </div>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface rounded-t-2xl z-50 safe-bottom"
              data-ocid="focus.modal"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-sm">Timer Settings</h3>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    data-ocid="focus.close_button"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Work (minutes)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="90"
                      value={tempWork}
                      onChange={(e) => setTempWork(e.target.value)}
                      className="bg-surface-elevated border-border"
                      data-ocid="focus.work_input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Break (minutes)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={tempBreak}
                      onChange={(e) => setTempBreak(e.target.value)}
                      className="bg-surface-elevated border-border"
                      data-ocid="focus.break_input"
                    />
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    className="w-full bg-gold text-background font-semibold rounded-xl"
                    data-ocid="focus.save_button"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
