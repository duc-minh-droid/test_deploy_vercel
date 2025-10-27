"use client";

import React from "react";
import { motion } from "framer-motion";
import { SiGithub, SiGoogle } from "react-icons/si";
import Link from "next/link";
import useRegister from "./useRegister";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const {
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
  } = useRegister();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-2 backdrop-blur-sm bg-background/95">
          <CardHeader>
            <motion.div 
              className="flex items-center gap-3 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="h-12 w-12 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Welcome back
                </motion.h1>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {mode === "signin" ? "Sign in to continue to Firebase Kit" : "Create your account to get started"}
                </motion.p>
              </div>
            </motion.div>
          </CardHeader>

          <CardContent>
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {mode === "signin" ? (
                <SignInForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  error={error}
                  handleSubmit={handleSubmit}
                  onToggleMode={() => setMode("signup")}
                  onRequestPasswordReset={handlePasswordReset}
                />
              ) : (
                <SignUpForm
                  displayName={displayName}
                  setDisplayName={setDisplayName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  error={error}
                  handleSubmit={handleSubmit}
                  onToggleMode={() => setMode("signin")}
                />
              )}
            </motion.div>

            <motion.div 
              className="mt-6 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="text-sm text-muted-foreground font-medium">Or continue with</div>
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </motion.div>

            <motion.div 
              className="mt-4 grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={handleGoogle} 
                  aria-label="Sign in with Google"
                  className="w-full gap-2 border-2 hover:border-primary/50 transition-all"
                >
                  <SiGoogle className="h-5 w-5 text-red-500" />
                  <span>Google</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={handleGithub} 
                  aria-label="Sign in with GitHub"
                  className="w-full gap-2 border-2 hover:border-primary/50 transition-all"
                >
                  <SiGithub className="h-5 w-5" />
                  <span>GitHub</span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                <span>←</span>
                <span>Back to home</span>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
