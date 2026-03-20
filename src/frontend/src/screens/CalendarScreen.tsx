import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useAllTasks, useCompletedDates } from "../hooks/useQueries";
import { calculateStreak } from "../lib/assistant";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function CalendarScreen() {
  const now = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const { data: completedDates = [] } = useCompletedDates();
  const { data: allTasks = [] } = useAllTasks();
  const { streak } = useAppContext();
  const computedStreak = streak || calculateStreak(completedDates);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const tasksByDate: Record<string, { total: number; completed: number }> = {};
  for (const task of allTasks) {
    if (!tasksByDate[task.date])
      tasksByDate[task.date] = { total: 0, completed: 0 };
    tasksByDate[task.date].total++;
    if (task.completed) tasksByDate[task.date].completed++;
  }

  const getDayStatus = (dateStr: string): "complete" | "partial" | "none" => {
    const entry = tasksByDate[dateStr];
    if (!entry || entry.total === 0) return "none";
    if (entry.completed === entry.total) return "complete";
    return "partial";
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Build stable cell keys
  const cells: { key: string; day: number | null }[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ key: `empty-${i}`, day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key: dateStr, day: d });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-24"
      data-ocid="calendar.page"
    >
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Track your consistency
        </p>
      </div>

      {computedStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-5 mb-4 bg-surface border border-border rounded-2xl p-4 flex items-center gap-3"
          data-ocid="calendar.card"
        >
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <Flame size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {computedStreak}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                day streak
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Keep going. Don't break the chain.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mx-5 bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-colors"
            data-ocid="calendar.pagination_prev"
          >
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <h2 className="text-sm font-semibold">{monthName}</h2>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-colors"
            data-ocid="calendar.pagination_next"
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div
              key={WEEKDAY_KEYS[i]}
              className="text-center text-xs text-muted-foreground font-medium py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map(({ key, day }) => {
            if (!day) return <div key={key} />;
            const dateStr = key;
            const isToday = dateStr === todayStr;
            const status = getDayStatus(dateStr);
            const isFuture = dateStr > todayStr;

            return (
              <div key={dateStr} className="flex flex-col items-center py-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isToday
                      ? "bg-gold text-background"
                      : status === "complete"
                        ? "bg-gold/15 text-gold"
                        : "text-foreground"
                  }`}
                >
                  {day}
                </div>
                {!isFuture && status !== "none" && !isToday && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      status === "complete" ? "bg-gold" : "bg-destructive/60"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-xs text-muted-foreground">All complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive/60" />
          <span className="text-xs text-muted-foreground">Partial</span>
        </div>
      </div>
    </div>
  );
}
