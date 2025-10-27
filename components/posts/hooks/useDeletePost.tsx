"use client";

import postsService from "../../../firebase/services/postsService";

export default function useDeletePost() {
  const deletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return false;

    try {
      await postsService.deletePost(postId);
      alert("Post deleted successfully.");
      return true;
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("Failed to delete post.");
      return false;
    }
  };

  return { deletePost };
}
