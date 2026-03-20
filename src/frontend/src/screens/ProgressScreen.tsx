import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Plus, Target, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Goal } from "../backend.d";
import AddGoalSheet from "../components/AddGoalSheet";
import AddTaskSheet from "../components/AddTaskSheet";
import { useAppContext } from "../context/AppContext";
import { useAllTasks, useDeleteGoal, useGoals } from "../hooks/useQueries";

export default function ProgressScreen() {
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addTaskGoal, setAddTaskGoal] = useState<Goal | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: allTasks = [] } = useAllTasks();
  const deleteGoal = useDeleteGoal();
  const { setActiveGoal } = useAppContext();

  const getGoalStats = (goalId: bigint) => {
    const tasks = allTasks.filter((t) => t.goalId === goalId);
    const completed = tasks.filter((t) => t.completed).length;
    return { total: tasks.length, completed };
  };

  const handleDeleteGoal = async (id: bigint) => {
    try {
      await deleteGoal.mutateAsync(id);
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedGoal((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-24"
      data-ocid="progress.page"
    >
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Progress</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your goals, your momentum
          </p>
        </div>
        <Button
          onClick={() => setAddGoalOpen(true)}
          size="sm"
          className="bg-gold text-background rounded-full font-semibold text-xs px-3 h-8 hover:opacity-90"
          data-ocid="progress.open_modal_button"
        >
          <Plus size={14} className="mr-1" />
          New Goal
        </Button>
      </div>

      <div className="px-5 space-y-3">
        {goalsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-surface" />
            ))}
          </>
        ) : goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-border rounded-2xl"
            data-ocid="progress.empty_state"
          >
            <Target size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No goals yet.</p>
            <button
              type="button"
              onClick={() => setAddGoalOpen(true)}
              className="text-gold text-sm mt-1 font-medium"
              data-ocid="progress.add_goal_button"
            >
              Create your first goal.
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {goals.map((goal, i) => {
              const { total, completed } = getGoalStats(goal.id);
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const idStr = goal.id.toString();
              const isExpanded = expandedGoal === idStr;
              const goalTasks = allTasks.filter((t) => t.goalId === goal.id);

              return (
                <motion.div
                  key={idStr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface border border-border rounded-2xl overflow-hidden"
                  data-ocid={`progress.item.${i + 1}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => {
                          setActiveGoal(goal);
                          toggleExpand(idStr);
                        }}
                        data-ocid={`progress.toggle.${i + 1}`}
                      >
                        <p className="text-sm font-semibold">{goal.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 italic line-clamp-1">
                          "{goal.reason}"
                        </p>
                      </button>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setAddTaskGoal(goal)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground hover:text-gold transition-colors"
                          data-ocid={`progress.add_task_button.${i + 1}`}
                          aria-label="Add task"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground hover:text-destructive transition-colors"
                          data-ocid={`progress.delete_button.${i + 1}`}
                          aria-label="Delete goal"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(idStr)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground"
                          data-ocid={`progress.expand_button.${i + 1}`}
                        >
                          {isExpanded ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress
                        value={pct}
                        className="flex-1 h-1.5 bg-surface-elevated [&>div]:bg-gold"
                      />
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {completed}/{total} tasks
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && goalTasks.length > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-3 space-y-1.5">
                          {goalTasks.map((task) => (
                            <div
                              key={task.id.toString()}
                              className="flex items-center gap-2 text-xs py-1.5"
                              data-ocid="progress.row"
                            >
                              <div
                                className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                                  task.completed
                                    ? "bg-gold border-gold"
                                    : "border-border"
                                }`}
                              />
                              <span
                                className={`flex-1 truncate ${
                                  task.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {task.name}
                              </span>
                              <span className="text-muted-foreground text-[10px]">
                                {task.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AddGoalSheet open={addGoalOpen} onClose={() => setAddGoalOpen(false)} />
      <AddTaskSheet
        open={!!addTaskGoal}
        onClose={() => setAddTaskGoal(null)}
        goals={goals}
        defaultGoalId={addTaskGoal?.id}
      />
    </div>
  );
}
