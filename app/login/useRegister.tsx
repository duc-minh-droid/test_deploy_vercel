"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, signupWithEmail, signInWithGoogle, signInWithGitHub, sendResetEmail } from "../../firebase/auth/authService";

export type Mode = "signin" | "signup";

export function useRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const router = useRouter();
  const [next, setNext] = useState("/");

  useEffect(() => {
    try {
      const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      const n = sp.get("next") || "/";
      setNext(n);
    } catch (e) {
      setNext("/");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, displayName || undefined);
      }
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || (mode === "signin" ? "Login failed" : "Signup failed"));
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || "Google sign-in failed");
    }
  }

  async function handleGithub() {
    try {
      await signInWithGitHub();
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || "GitHub sign-in failed");
    }
  }

  async function handlePasswordReset(resetEmail: string) {
    setError(null);
    try {
      await sendResetEmail(resetEmail);
      return { success: true } as const;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err) || "Failed to send reset email";
      setError(message);
      return { success: false, error: message } as const;
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    error,
    mode,
    setMode,
    handleSubmit,
    handleGoogle,
    handleGithub,
    handlePasswordReset,
  } as const;
}

export default useRegister;
