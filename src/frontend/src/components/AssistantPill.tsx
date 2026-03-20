import { Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface AssistantPillProps {
  message: string;
  autoHide?: boolean;
  duration?: number;
}

export default function AssistantPill({
  message,
  autoHide = true,
  duration = 6000,
}: AssistantPillProps) {
  const [visible, setVisible] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setVisible is a stable setter
  useEffect(() => {
    setVisible(true);
    if (!autoHide) return;
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, autoHide, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2.5 shadow-card max-w-xs"
          data-ocid="assistant.toast"
        >
          <Sparkles size={14} className="text-gold flex-shrink-0" />
          <p className="text-xs text-foreground leading-tight flex-1">
            {message}
          </p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
