import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateGoal } from "../hooks/useQueries";

interface AddGoalSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function AddGoalSheet({ open, onClose }: AddGoalSheetProps) {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const createGoal = useCreateGoal();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Goal title is required");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is required — it fuels your discipline");
      return;
    }
    try {
      await createGoal.mutateAsync({
        title: title.trim(),
        reason: reason.trim(),
      });
      toast.success("Goal created");
      setTitle("");
      setReason("");
      onClose();
    } catch {
      toast.error("Failed to create goal");
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
            data-ocid="add_goal.modal"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold">New Goal</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground"
                  data-ocid="add_goal.close_button"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Goal Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Launch my startup"
                    className="bg-surface-elevated border-border text-foreground focus:border-gold"
                    autoFocus
                    data-ocid="add_goal.input"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Why does this matter? <span className="text-gold">*</span>
                  </Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Your reason keeps you going when motivation fades..."
                    className="bg-surface-elevated border-border text-foreground focus:border-gold resize-none"
                    rows={3}
                    data-ocid="add_goal.textarea"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createGoal.isPending}
                  className="w-full bg-gold text-background font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  data-ocid="add_goal.submit_button"
                >
                  <Target size={16} className="mr-1" />
                  {createGoal.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
