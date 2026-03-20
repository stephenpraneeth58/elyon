import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AuthScreen() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background px-6"
      data-ocid="auth.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-5xl font-bold tracking-[0.2em] text-gold"
          >
            ELYON
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-muted-foreground text-sm mt-2 tracking-wider"
          >
            Execute with purpose.
          </motion.p>
        </div>

        {/* Form fields (UI only, actual auth via Internet Identity) */}
        <div className="w-full space-y-3 mb-6">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-surface border-border text-foreground focus:border-gold h-11"
              data-ocid="auth.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-surface border-border text-foreground focus:border-gold h-11"
              data-ocid="auth.password_input"
            />
          </div>
        </div>

        {/* Primary CTA - Internet Identity */}
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="w-full h-12 bg-gold text-background font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm tracking-wide"
          data-ocid="auth.primary_button"
        >
          {isLoggingIn ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <Fingerprint size={18} className="mr-2" />
          )}
          {isLoggingIn ? "Signing in..." : "Sign In"}
        </Button>

        <div className="flex items-center gap-3 my-5 w-full">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">secured by</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Internet Identity — no passwords stored.
          <br />
          Your data is yours, always.
        </p>
      </motion.div>
    </div>
  );
}
