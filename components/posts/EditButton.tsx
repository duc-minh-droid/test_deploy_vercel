"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEditPost from "./hooks/useEditPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";

type EditButtonProps = {
  postId: string;
  userId: string;
  authorId: string;
  currentTitle: string;
  currentImageURL?: string;
};

export default function EditButton({ postId, userId, authorId, currentTitle, currentImageURL }: EditButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [file, setFile] = useState<File | null>(null);
  const { editPost, loading } = useEditPost();

  if (userId !== authorId) return null;

  async function handleEdit() {
    const ok = await editPost(postId, { title, file, currentImageURL: currentImageURL || null });
    if (ok) setIsEditing(false);
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mt-3"
          >
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Title" 
              disabled={loading} 
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              disabled={loading}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleEdit} size="sm" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" key="edit-btn">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
}