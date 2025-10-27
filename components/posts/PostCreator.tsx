"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../firebase/auth/useAuth";
import { usePostCreator } from "./hooks/usePostCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function PostCreator() {
  const authAny = useAuth() as any;
  const user: any = authAny?.user;
  const {
    title,
    setTitle,
    fileInputRef,
    preview,
    loading,
    message,
    handleSubmit,
    handleFileChange,
  } = usePostCreator(user);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create a post</CardTitle>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Please{" "}
                  <Link href="/login" className="text-primary underline hover:text-primary/80 transition-colors">
                    sign in
                  </Link>{" "}
                  to create a post.
                </p>
              </CardContent>
            </motion.div>
          )}

          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                disabled={loading}
              />

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {preview ? "Change Image" : "Add Image (Optional)"}
                  </Button>
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Image uploads use Appwrite storage
                </p>
              </div>

              {preview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </motion.div>
              )}

              <div className="flex items-center gap-3">
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </Button>
                </motion.div>
              </div>

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {message}
                </motion.p>
              )}
            </form>
          </CardContent>
        </motion.div>
        )}
      </AnimatePresence>
      </Card>
    </motion.div>
  );
}
