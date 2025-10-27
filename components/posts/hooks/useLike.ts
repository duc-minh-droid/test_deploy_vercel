import { useState, useEffect } from "react";
import postsService from "../../../firebase/services/postsService";

export function useLike(postId: string, initialLikes: number, user: { uid: string } | null) {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  useEffect(() => {
    const fetchLikedStatus = async () => {
      if (!user) return;

      const cachedStatus = localStorage.getItem(`liked_${postId}`);
      if (cachedStatus !== null) {
        setLiked(cachedStatus === "true");
        return;
      }

      try {
        const isLiked = await postsService.getLikedStatus(postId, user.uid);
        setLiked(isLiked);
        localStorage.setItem(`liked_${postId}`, String(isLiked));
      } catch (e) {
        console.error("Failed to fetch liked status", e);
      }
    };

    fetchLikedStatus();
  }, [postId, user]);

  const toggleLike = async () => {
    if (loading || !user) return;

    const uid = user.uid;
    const isLiked = liked;
    setLiked(!isLiked);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    setLoading(true);

    try {
      await postsService.toggleLike(postId, uid, !isLiked);
      localStorage.setItem(`liked_${postId}`, String(!isLiked));
    } catch (e) {
      console.error("Failed to toggle like", e);
      setLiked(isLiked);
      setLikeCount((prev) => prev + (isLiked ? 1 : -1));
    } finally {
      setLoading(false);
    }
  };

  return { liked, likeCount, loading, toggleLike };
}