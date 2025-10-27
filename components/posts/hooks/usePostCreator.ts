import { useEffect, useRef, useState } from "react";
import postsService from "../../../firebase/services/postsService";

export function usePostCreator(user: any) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!user) return setMessage("You must be signed in to post.");
    if (!title.trim()) return setMessage("Please enter a title.");

    setLoading(true);
    try {
      await postsService.createPost({
        title: title.trim(),
        file,
        author: {
          uid: user.uid,
          displayName: user.displayName || user.email || "",
          photoURL: user.photoURL || null,
        },
      });
      setTitle("");
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreview(null);
      setMessage("Post created");
    } catch (err: any) {
      setMessage(err?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return {
    title,
    setTitle,
    fileInputRef,
    preview,
    loading,
    message,
    handleSubmit,
    handleFileChange,
  };
}