"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../firebase/auth/useAuth";
import { linkGoogle, linkGitHub } from "../../firebase/auth/authService";
import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "react-icons/si";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ConnectProviderButtons() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handle = async (provider: "google" | "github") => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (provider === "google") {
        await linkGoogle();
        setSuccess("Linked Google account");
      } else {
        await linkGitHub();
        setSuccess("Linked GitHub account");
      }
    } catch (e: unknown) {
      console.error(e);
      const msg = e && typeof e === "object" && "message" in e ? (e as any).message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handle("google")}
            disabled={loading}
          >
            <SiGoogle className="h-5 w-5" />
            <span>Google</span>
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handle("github")}
            disabled={loading}
          >
            <SiGithub className="h-5 w-5" />
            <span>GitHub</span>
          </Button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Linking...</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
