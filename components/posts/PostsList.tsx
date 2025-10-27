"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePosts } from "./hooks/usePosts";
import Post from "./Post";
import SearchBar from "./SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PostsList() {
  const [query, setQuery] = useState("");
  const { posts, loading, hasMore, doSearch } = usePosts(4);

  function onSearch() {
    doSearch(query);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onSearch();
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar initialQuery={query} onSearch={(q) => { setQuery(q); doSearch(q); }} />
          
          {posts.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">
              No posts yet. Be the first to create one!
            </p>
          )}

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {posts.map((p) => (
              <Post key={p.id} post={p} />
            ))}
          </motion.div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No more posts to load
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
