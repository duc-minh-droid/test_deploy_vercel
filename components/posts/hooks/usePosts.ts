import { useCallback, useEffect, useRef, useState } from "react";
import postsService, { Post as PostType } from "../../../firebase/services/postsService";

// Hook contract:
// - loads posts in pages of `pageSize` (default 4)
// - exposes posts[], loading, hasMore, loadMore(), and reset()
export function usePosts(pageSize = 4) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // active search term used for fetches; updated only when doSearch is called
  const activeSearchTerm = useRef<string | undefined>(undefined);

  // keep the last query snapshot for startAfter
  const lastDocRef = useRef<any>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadPage = useCallback(
    async (opts: { append?: boolean } = { append: true }) => {
      if (loading) return;
      setLoading(true);
      try {
        const startAfter = lastDocRef.current || undefined;
        const res = await postsService.fetchPostsPage(pageSize, startAfter, activeSearchTerm.current);
        if (!isMounted.current) return;

        if (opts.append) {
          setPosts((p) => [...p, ...res.posts]);
        } else {
          setPosts(res.posts);
        }

        lastDocRef.current = res.lastDoc || null;
        setHasMore(Boolean(res.hasMore));
      } catch (e) {
        console.error("Failed to load posts page", e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [loading, pageSize]
  );

  // initial load
  useEffect(() => {
    // reset state then load first page
    lastDocRef.current = null;
    setPosts([]);
    setHasMore(true);
    loadPage({ append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  // expose a function to perform a search explicitly
  const doSearch = useCallback((term?: string) => {
    // set active term, reset pagination and load
    activeSearchTerm.current = term && term.length > 0 ? term : undefined;
    lastDocRef.current = null;
    setPosts([]);
    setHasMore(true);
    loadPage({ append: false });
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    loadPage({ append: true });
  }, [hasMore, loading, loadPage]);

  const reset = useCallback(() => {
    lastDocRef.current = null;
    setPosts([]);
    setHasMore(true);
    loadPage({ append: false });
  }, [loadPage]);

  // simple scroll-to-bottom detector
  useEffect(() => {
    function onScroll() {
      try {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const innerH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        // when within 200px of bottom, load more
        if (docH - (scrollTop + innerH) < 200) {
          loadMore();
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  return { posts, loading, hasMore, loadMore, reset, doSearch };
}