import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Play, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import AddTaskSheet from "../components/AddTaskSheet";
import AssistantPill from "../components/AssistantPill";
import type { Tab } from "../components/BottomNav";
import MountainProgress from "../components/MountainProgress";
import { useAppContext } from "../context/AppContext";
import {
  useCompleteTask,
  useDeleteTask,
  useGoals,
  useTodayTasks,
  useUncompleteTask,
} from "../hooks/useQueries";
import {
  getAssistantMessage,
  getDaysLeftInYear,
  getGreeting,
} from "../lib/assistant";

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const { userName, streak, activeGoal } = useAppContext();
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: tasks = [], isLoading: tasksLoading } = useTodayTasks();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const deleteTask = useDeleteTask();

  const daysLeft = getDaysLeftInYear();
  const visibleTasks = tasks.slice(0, 5);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const assistantMessage = getAssistantMessage(
    "app_open",
    activeGoal?.title ?? goals[0]?.title ?? "",
    activeGoal?.reason ?? goals[0]?.reason ?? "",
    streak,
    daysLeft,
  );

  const handleToggleTask = async (id: bigint, completed: boolean) => {
    try {
      if (completed) {
        await uncompleteTask.mutateAsync(id);
      } else {
        await completeTask.mutateAsync(id);
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: bigint) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task removed");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const getGoalTitle = (goalId: bigint) => {
    return goals.find((g) => g.id === goalId)?.title ?? "";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-24"
      data-ocid="home.page"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs text-muted-foreground tracking-wide uppercase mb-0.5">
            {today}
          </p>
          <h1 className="text-xl font-semibold">
            {getGreeting()},{" "}
            <span className="text-gold">{userName || "there"}</span>
          </h1>
        </motion.div>
      </div>

      {/* Days Left Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mx-5 bg-surface rounded-2xl p-5 mb-4 border border-border"
        data-ocid="home.card"
      >
        <div className="flex items-end gap-3">
          <div>
            <p className="text-6xl font-bold text-foreground leading-none">
              {daysLeft}
            </p>
            <p className="text-xs text-gold tracking-widest uppercase mt-1 font-medium">
              Days Left in Year
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 ml-auto bg-surface-elevated rounded-full px-3 py-1.5">
              <Flame size={14} className="text-gold" />
              <span className="text-xs font-semibold text-foreground">
                {streak}
              </span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mountain Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex justify-center py-4"
      >
        <MountainProgress completed={completedCount} total={totalCount} />
      </motion.div>

      {/* Today's Tasks */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Today
          </h2>
          <button
            type="button"
            onClick={() => setAddTaskOpen(true)}
            className="flex items-center gap-1 text-gold text-xs font-medium"
            data-ocid="home.open_modal_button"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>

        {tasksLoading || goalsLoading ? (
          <div className="space-y-2" data-ocid="home.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl bg-surface" />
            ))}
          </div>
        ) : visibleTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 border border-dashed border-border rounded-2xl"
            data-ocid="home.empty_state"
          >
            <p className="text-muted-foreground text-sm">No tasks for today.</p>
            <button
              type="button"
              onClick={() => setAddTaskOpen(true)}
              className="text-gold text-sm mt-1 font-medium"
              data-ocid="home.add_task_button"
            >
              Add one below.
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2" data-ocid="home.list">
            <AnimatePresence>
              {visibleTasks.map((task, i) => (
                <motion.div
                  key={task.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-surface rounded-xl p-3.5 border border-border"
                  data-ocid={`home.item.${i + 1}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() =>
                      handleToggleTask(task.id, task.completed)
                    }
                    className="border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    data-ocid={`home.checkbox.${i + 1}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.name}
                    </p>
                    {getGoalTitle(task.goalId) && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {getGoalTitle(task.goalId)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    data-ocid={`home.delete_button.${i + 1}`}
                    aria-label="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Start Focus CTA */}
      <div className="px-5 mt-auto">
        <Button
          onClick={() => onNavigate("focus")}
          className="w-full bg-gold text-background font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm tracking-wide h-12"
          data-ocid="home.primary_button"
        >
          <Play size={16} fill="currentColor" />
          Start Focus
        </Button>
      </div>

      {/* Assistant Pill */}
      {(goals.length > 0 || tasks.length > 0) && (
        <div className="flex justify-center px-5 mt-4">
          <AssistantPill message={assistantMessage} />
        </div>
      )}

      <AddTaskSheet
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        goals={goals}
        defaultGoalId={activeGoal?.id}
      />
    </div>
  );
}
