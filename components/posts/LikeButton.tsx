"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../firebase/auth/useAuth";
import { useLike } from "./hooks/useLike";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type Props = {
  postId: string;
  likes: number;
};

export default function LikeButton({ postId, likes }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { liked, likeCount, loading, toggleLike } = useLike(postId, likes, user);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={liked ? "default" : "outline"}
        size="sm"
        onClick={toggleLike}
        disabled={loading || authLoading}
        className="gap-2"
      >
        <motion.div
          animate={{ scale: liked ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </motion.div>
        <span>{likeCount}</span>
      </Button>
    </div>
  );
}
