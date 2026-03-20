import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Goal } from "../backend.d";
import { useCreateTask } from "../hooks/useQueries";
import { getTodayDate } from "../lib/assistant";

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  goals: Goal[];
  defaultGoalId?: bigint;
}

export default function AddTaskSheet({
  open,
  onClose,
  goals,
  defaultGoalId,
}: AddTaskSheetProps) {
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState<string>(
    defaultGoalId ? defaultGoalId.toString() : (goals[0]?.id?.toString() ?? ""),
  );
  const [date, setDate] = useState(getTodayDate());
  const createTask = useCreateTask();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!goalId) {
      toast.error("Please select a goal");
      return;
    }
    try {
      await createTask.mutateAsync({
        name: name.trim(),
        date,
        goalId: BigInt(goalId),
      });
      toast.success("Task added");
      setName("");
      onClose();
    } catch {
      toast.error("Failed to add task");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface rounded-t-2xl z-50 safe-bottom"
            data-ocid="add_task.modal"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold">Add Task</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground"
                  data-ocid="add_task.close_button"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Task Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What needs to be done?"
                    className="bg-surface-elevated border-border text-foreground focus:border-gold focus:ring-gold/20"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                    data-ocid="add_task.input"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Goal
                  </Label>
                  <Select value={goalId} onValueChange={setGoalId}>
                    <SelectTrigger
                      className="bg-surface-elevated border-border text-foreground"
                      data-ocid="add_task.select"
                    >
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border">
                      {goals.map((g) => (
                        <SelectItem
                          key={g.id.toString()}
                          value={g.id.toString()}
                        >
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-surface-elevated border-border text-foreground focus:border-gold"
                    data-ocid="add_task.date_input"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createTask.isPending}
                  className="w-full bg-gold text-background font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  data-ocid="add_task.submit_button"
                >
                  <Plus size={16} className="mr-1" />
                  {createTask.isPending ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
