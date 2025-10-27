"use client";

import React from "react";
import { motion } from "framer-motion";
import useDeletePost from "./hooks/useDeletePost";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteButtonProps = {
  postId: string;
  userId: string;
  authorId: string;
};

export default function DeleteButton({ postId, userId, authorId }: DeleteButtonProps) {
  const { deletePost } = useDeletePost();

  if (userId !== authorId) return null;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button 
        onClick={() => deletePost(postId)} 
        variant="destructive" 
        size="sm"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}