import { onCollectionSnapshot, addDocument, runFirestoreTransaction } from "./firestoreService";
import { getFileDownloadUrl, uploadFile } from "./appwriteService";
import { serverTimestamp, doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export interface PostAuthor {
  uid?: string;
  displayName?: string;
  photoURL?: string | null;
}

export interface Post {
  id: string;
  title: string;
  imageURL?: string | null;
  imageSrc?: string | null; // resolved download url
  author?: PostAuthor;
  likes?: number;
  createdAt?: any; // Firestore Timestamp or server value; callers can format
}

function timestampToMs(ts: any): number {
  if (!ts) return 0;
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (ts && typeof ts.seconds === "number") return ts.seconds * 1000;
  const n = Number(ts);
  return Number.isFinite(n) ? n : 0;
}

// Subscribe to posts collection and resolve image download URLs when possible.
// Returns the unsubscribe function from Firestore onSnapshot.
export function subscribeToPosts(callback: (posts: Post[]) => void) {
  const un = onCollectionSnapshot("posts", async (docs: any[]) => {
    // First, create posts without waiting for image URLs
    const posts: Post[] = docs.map((d: any) => ({
      id: d.id,
      title: d.title ?? "",
      imageURL: d.imageURL ?? null,
      imageSrc: null,
      author: d.author ?? undefined,
      likes: typeof d.likes === "number" ? d.likes : 0,
      createdAt: d.createdAt ?? null,
    }));

    // newest first
    posts.sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt));
    
    // Call callback immediately with posts (without images)
    callback(posts);

    // Then fetch image URLs in parallel and update
    Promise.all(
      posts.map(async (post) => {
        if (post.imageURL) {
          try {
            const url: any = await getFileDownloadUrl({ fileId: post.imageURL });
            post.imageSrc = typeof url === "string" ? url : (url && (url.url || url.href)) || null;
          } catch (e) {
            post.imageSrc = null;
          }
        }
        return post;
      })
    ).then((resolved) => {
      // Call callback again with resolved image URLs
      callback(resolved);
    });
  });

  return un;
}

// Convenience: fetch posts once (resolves after first snapshot)
export async function getPostsOnce(): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    try {
      const un = subscribeToPosts((posts) => {
        resolve(posts);
        try {
          if (typeof un === "function") un();
        } catch (e) {}
      });
    } catch (e) {
      reject(e);
    }
  });
}

// Fetch a single page of posts ordered by createdAt desc.
// Returns { posts, lastDoc, hasMore } where lastDoc is the last QueryDocumentSnapshot
// usable as startAfter for the next page. This resolves imageSrc like subscribeToPosts.
export async function fetchPostsPage(
  pageSize = 4,
  startAfterDoc?: any,
  searchTerm?: string
): Promise<{ posts: Post[]; lastDoc: any; hasMore: boolean }> {
  // build query
  const { collection, query, orderBy, limit, getDocs, startAfter } = await import("firebase/firestore");
  const col = collection(db, "posts");

  // If no searchTerm provided, use a simple single-page fetch by createdAt desc.
  if (!searchTerm) {
    let q: any;
    if (startAfterDoc) {
      q = query(col, orderBy("createdAt", "desc"), startAfter(startAfterDoc), limit(pageSize));
    } else {
      q = query(col, orderBy("createdAt", "desc"), limit(pageSize));
    }

    const snap = await getDocs(q);
    const docs = [] as any[];
    snap.forEach((d: any) => docs.push({ id: d.id, ...d.data(), __snap: d }));

    // Create posts immediately without waiting for image URLs
    const posts: Post[] = docs.map((d: any) => ({
      id: d.id,
      title: d.title ?? "",
      imageURL: d.imageURL ?? null,
      imageSrc: null,
      author: d.author ?? undefined,
      likes: typeof d.likes === "number" ? d.likes : 0,
      createdAt: d.createdAt ?? null,
    }));

    // Fetch image URLs in parallel
    await Promise.all(
      posts.map(async (post) => {
        if (post.imageURL) {
          try {
            const url: any = await getFileDownloadUrl({ fileId: post.imageURL });
            post.imageSrc = typeof url === "string" ? url : (url && (url.url || url.href)) || null;
          } catch (e) {
            post.imageSrc = null;
          }
        }
      })
    );

    const lastDoc = docs.length > 0 ? docs[docs.length - 1].__snap : null;
    const hasMore = docs.length === pageSize;
    return { posts, lastDoc, hasMore };
  }

  // When searchTerm is provided, Firestore doesn't support a simple 'contains' query on strings.
  // We'll fetch in larger batches and filter client-side for title includes(searchTerm) (case-insensitive)
  // until we gather `pageSize` matches or run out of documents.
  const term = (searchTerm || "").toLowerCase();
  const batchSize = Math.max(pageSize * 3, pageSize);

  let q: any;
  if (startAfterDoc) {
    q = query(col, orderBy("createdAt", "desc"), startAfter(startAfterDoc), limit(batchSize));
  } else {
    q = query(col, orderBy("createdAt", "desc"), limit(batchSize));
  }

  const snap = await getDocs(q);
  const docs = [] as any[];
  snap.forEach((d: any) => docs.push({ id: d.id, ...d.data(), __snap: d }));

  const filteredRaw = docs.filter((d) => {
    const t = (d.title || "").toString().toLowerCase();
    return t.indexOf(term) !== -1;
  });

  // Create posts immediately without waiting for image URLs
  const posts: Post[] = filteredRaw.map((d: any) => ({
    id: d.id,
    title: d.title ?? "",
    imageURL: d.imageURL ?? null,
    imageSrc: null,
    author: d.author ?? undefined,
    likes: typeof d.likes === "number" ? d.likes : 0,
    createdAt: d.createdAt ?? null,
  }));

  // Fetch image URLs in parallel
  await Promise.all(
    posts.map(async (post) => {
      if (post.imageURL) {
        try {
          const url: any = await getFileDownloadUrl({ fileId: post.imageURL });
          post.imageSrc = typeof url === "string" ? url : (url && (url.url || url.href)) || null;
        } catch (e) {
          post.imageSrc = null;
        }
      }
    })
  );

  const lastDoc = docs.length > 0 ? docs[docs.length - 1].__snap : null;
  // hasMore indicates whether there might be more matching documents after this batch.
  // If we fetched a full batch, assume there may be more.
  const hasMore = docs.length === batchSize;

  // Return at most pageSize posts (client-side pagination)
  return { posts: posts.slice(0, pageSize), lastDoc, hasMore };
}

export async function createPost(params: { title: string; file?: File | null; author?: PostAuthor }) {
  const { title, file, author } = params;
  let imageURL: string | null = null;
  if (file) {
    const res: any = await uploadFile(file, { bucketId: undefined });
    imageURL = res.fileId || (res.file && res.file.$id) || null;
  }

  const postDoc: any = {
    title,
    imageURL,
    author: author || null,
    likes: 0,
    createdAt: serverTimestamp(),
  };

  const added = await addDocument("posts", postDoc);
  return added;
}

// Update likes atomically via a transaction. delta can be +1 or -1 etc.
// Update likes atomically via a transaction. This implementation records per-user
// like documents under posts/{postId}/likes/{userId} so we can prevent duplicate
// likes from the same user. If `userId` is not provided and the operation requires
// authentication (liking), the transaction will throw.
export async function updateLikes(postId: string, delta = 1, userId?: string) {
  return await runFirestoreTransaction(async (transaction: any) => {
    const ref = doc(db, "posts", postId);
    const snap: any = await transaction.get(ref);
    if (!snap.exists()) throw new Error("Post not found");

    const current = (snap.data() && snap.data().likes) || 0;

    // We'll treat delta > 0 as a 'like' attempt and delta < 0 as an 'unlike'.
    // For likes, require a userId and create a per-user like doc if missing.
    let change = 0;
    if (delta > 0) {
      if (!userId) throw new Error("Authentication required to like posts");
      const likeRef = doc(db, "posts", postId, "likes", userId);
      const likeSnap: any = await transaction.get(likeRef);
      if (likeSnap.exists()) {
        // user already liked -> no change
        change = 0;
      } else {
        // create like doc and increment
        transaction.set(likeRef, { uid: userId, createdAt: serverTimestamp() });
        change = 1;
      }
    } else if (delta < 0) {
      // unlike flow: if userId provided, remove user's like doc if present
      if (userId) {
        const likeRef = doc(db, "posts", postId, "likes", userId);
        const likeSnap: any = await transaction.get(likeRef);
        if (likeSnap.exists()) {
          transaction.delete(likeRef);
          change = -1;
        } else {
          change = 0;
        }
      } else {
        // no userId provided; best-effort: don't change
        change = 0;
      }
    }

    const next = Math.max(0, current + change);
    if (next !== current) transaction.update(ref, { likes: next });
    return { id: postId, likes: next };
  });
}

// Fetch the liked status for a specific post and user
export async function getLikedStatus(postId: string, userId: string): Promise<boolean> {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}

// Set the liked status for a specific post and user
export async function setLikedStatus(postId: string, userId: string, liked: boolean): Promise<void> {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  if (liked) {
    await setDoc(likeRef, { uid: userId, createdAt: serverTimestamp() });
  } else {
    await deleteDoc(likeRef);
  }
}

// Toggle like status and update likes count in a single transaction
export async function toggleLike(postId: string, userId: string, liked: boolean): Promise<void> {
  await runFirestoreTransaction(async (transaction: any) => {
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "posts", postId, "likes", userId);

    const postSnap: any = await transaction.get(postRef);
    if (!postSnap.exists()) throw new Error("Post not found");

    const currentLikes = (postSnap.data() && postSnap.data().likes) || 0;
    const nextLikes = liked ? currentLikes + 1 : currentLikes - 1;

    if (liked) {
      transaction.set(likeRef, { uid: userId, createdAt: serverTimestamp() });
    } else {
      transaction.delete(likeRef);
    }

    transaction.update(postRef, { likes: Math.max(0, nextLikes) });
  });
}

// Delete a post by its ID
export async function deletePost(postId: string): Promise<void> {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
}

// Update a post by its ID
export async function updatePost(postId: string, data: { title: string; imageURL?: string | null }): Promise<void> {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, data);
}

export default {
  subscribeToPosts,
  getPostsOnce,
  fetchPostsPage,
  createPost,
  updateLikes,
  getLikedStatus,
  setLikedStatus,
  toggleLike,
  deletePost,
  updatePost,
};
