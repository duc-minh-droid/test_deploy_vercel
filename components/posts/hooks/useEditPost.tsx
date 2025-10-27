"use client";

import { useState } from "react";
import postsService from "../../../firebase/services/postsService";
import { uploadFile } from "../../../firebase/services/appwriteService";

export default function useEditPost() {
  const [loading, setLoading] = useState(false);

  const editPost = async (postId: string, data: { title: string; file?: File | null; currentImageURL?: string | null }) => {
    setLoading(true);
    try {
      let imageURL = data.currentImageURL || null;

      if (data.file) {
        const uploadResponse = await uploadFile(data.file, { bucketId: undefined });
        imageURL = uploadResponse.fileId || (uploadResponse.file && uploadResponse.file.$id) || null;
      }

      await postsService.updatePost(postId, { title: data.title, imageURL });
      alert("Post updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update post", error);
      alert("Failed to update post.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editPost, loading };
}
