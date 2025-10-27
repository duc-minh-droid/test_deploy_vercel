"use client";

import React from "react";
import { motion } from "framer-motion";
import { Post as PostType } from "../../firebase/services/postsService";
import LikeButton from "./LikeButton";
import { useAuth } from "../../firebase/auth/useAuth";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  post: PostType;
};

export default function Post({ post }: Props) {
  const authAny = useAuth() as any;
  const user: any = authAny?.user;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.article
      variants={item}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      layout
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <motion.div 
            className="flex items-center gap-3 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Avatar>
              <AvatarImage src={post.author?.photoURL} alt={post.author?.displayName || "user"} />
              <AvatarFallback>
                {post.author?.displayName ? post.author.displayName[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="font-medium">{post.author?.displayName || post.author?.uid || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {post.createdAt && post.createdAt.toDate ? post.createdAt.toDate().toLocaleString() : post.createdAt ? String(post.createdAt) : ""}
              </div>
            </div>
          </motion.div>

          <motion.h3 
            className="text-lg font-semibold mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {post.title}
          </motion.h3>

          {post.imageSrc && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mb-4 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src={post.imageSrc} 
                alt={post.title} 
                className="w-full max-h-96 object-cover"
              />
            </motion.div>
          )}

          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LikeButton postId={post.id} likes={post.likes ?? 0} />
            {user && (
              <>
                <EditButton
                  postId={post.id}
                  userId={user.uid}
                  authorId={post.author?.uid || ""}
                  currentTitle={post.title}
                  currentImageURL={post.imageSrc || undefined}
                />
                <DeleteButton postId={post.id} userId={user.uid} authorId={post.author?.uid || ""} />
              </>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
