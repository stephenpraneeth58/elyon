import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

interface OnboardingScreenProps {
  onComplete: (name: string) => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [name, setName] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync(name.trim());
      onComplete(name.trim());
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background px-6"
      data-ocid="onboarding.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">What's your name?</h2>
          <p className="text-muted-foreground text-sm">
            This is how Elyon will address you.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Your Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="bg-surface border-border text-foreground focus:border-gold h-12 text-base"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              data-ocid="onboarding.input"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saveProfile.isPending}
            className="w-full h-12 bg-gold text-background font-semibold rounded-xl hover:opacity-90 transition-opacity"
            data-ocid="onboarding.submit_button"
          >
            {saveProfile.isPending ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <ArrowRight size={18} className="mr-2" />
            )}
            {saveProfile.isPending ? "Saving..." : "Let's go"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
