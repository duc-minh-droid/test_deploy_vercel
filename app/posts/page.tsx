"use client";

import AuthButton from "../../components/auth/AuthButton";
import PostCreator from "../../components/posts/PostCreator";
import PostsList from "../../components/posts/PostsList";
import { ThemeToggle } from "../../components/theme-toggle";

export default function PostsPage() {
  return (
      

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <PostCreator />
          <PostsList />
        </div>
      </main>
  );
}
