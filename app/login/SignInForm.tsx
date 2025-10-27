"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  handleSubmit,
  onToggleMode,
  onRequestPasswordReset,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleMode: () => void;
  onRequestPasswordReset?: (email: string) => Promise<{ success: true } | { success: false; error: string }>;
}) {
  const [showReset, setShowReset] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState(email || "");
  const [resetMessage, setResetMessage] = React.useState<string | null>(null);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-sm font-medium mb-2 block" htmlFor="email">Email</label>
        <Input
          id="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="text-sm font-medium mb-2 block" htmlFor="password">Password</label>
        <Input
          id="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      <motion.div 
        className="flex items-center justify-between text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {!showReset ? (
            <motion.button 
              key="forgot-btn"
              type="button" 
              onClick={() => { setShowReset(true); setResetEmail(email); setResetMessage(null); }} 
              className="text-primary hover:underline font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Forgot password?
            </motion.button>
          ) : (
            <motion.div 
              key="reset-form"
              className="flex items-center gap-2 w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Input
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                type="email"
                className="h-8"
              />
              <Button
                type="button"
                size="sm"
                disabled={resetLoading}
                onClick={async () => {
                  if (!onRequestPasswordReset) return;
                  setResetLoading(true);
                  const res = await onRequestPasswordReset(resetEmail);
                  setResetLoading(false);
                  if (res.success) {
                    setResetMessage("If an account exists for that email, a reset link was sent.");
                    setShowReset(false);
                  } else {
                    setResetMessage(res.error || "Failed to send reset email");
                  }
                }}
              >
                {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
              <button type="button" onClick={() => setShowReset(false)} className="text-sm text-muted-foreground hover:underline">
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          type="button" 
          onClick={onToggleMode} 
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Need an account?
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {resetMessage && (
          <motion.div 
            key="reset-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm p-3 bg-green-500/10 rounded-md"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{resetMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
