import { db } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  setDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner"; // using sonner since main project uses it

let postsRef = collection(db, "activities");
let userRef = collection(db, "users");
let likeRef = collection(db, "alumni_likes");
let commentsRef = collection(db, "alumni_comments");

export const postStatus = async (object) => {
  try {
    await addDoc(postsRef, {
      ...object,
      createdAt: serverTimestamp(),
    });
    toast.success("Post has been added successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to add post");
  }
};

export const getStatus = (setAllStatus) => {
  // Prefer server-side ordering by createdAt; fall back to client sort if missing
  const q = query(postsRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (response) => {
      const items = response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      });
      setAllStatus(items);
    },
    (err) => {
      console.warn("getStatus snapshot error:", err);
      // Fallback: basic un-ordered snapshot
      const q2 = query(postsRef);
      return onSnapshot(q2, (resp2) => {
        const items = resp2.docs
          .map((d) => ({ ...d.data(), id: d.id }))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? 0;
            const tb = b.createdAt?.toMillis?.() ?? 0;
            return tb - ta;
          });
        setAllStatus(items);
      });
    }
  );
};

export const getSingleStatus = (setAllStatus, id) => {
  const singlePostQuery = query(postsRef, where("authorId", "==", id));
  return onSnapshot(singlePostQuery, (response) => {
    setAllStatus(
      response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      })
    );
  });
};

export const likePost = async (userId, postId, liked) => {
  try {
    let docToLike = doc(likeRef, `${userId}_${postId}`);
    if (liked) {
      await deleteDoc(docToLike);
    } else {
      await setDoc(docToLike, { userId, postId });
    }
  } catch (err) {
    console.error(err);
  }
};

export const getLikesByUser = (userId, postId, setLiked, setLikesCount) => {
  try {
    let likeQuery = query(likeRef, where("postId", "==", postId));

    return onSnapshot(likeQuery, (response) => {
      let likes = response.docs.map((doc) => doc.data());
      let likesCount = likes?.length;

      const isLiked = likes.some((like) => like.userId === userId);

      setLikesCount(likesCount);
      setLiked(isLiked);
    });
  } catch (err) {
    console.error(err);
  }
};

export const postComment = async (postId, comment, timeStamp, name, photoURL) => {
  try {
    await addDoc(commentsRef, {
      postId,
      comment,
      timeStamp,
      name,
      photoURL: photoURL || ""
    });
  } catch (err) {
    console.error(err);
  }
};

export const getComments = (postId, setComments) => {
  try {
    let singlePostQuery = query(commentsRef, where("postId", "==", postId), orderBy("timeStamp", "desc"));

    return onSnapshot(singlePostQuery, (response) => {
      const comments = response.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setComments(comments);
    });
  } catch (err) {
    console.error(err);
  }
};

export const updatePost = async (id, content, postImage) => {
  let docToUpdate = doc(postsRef, id);
  try {
    await updateDoc(docToUpdate, { content, postImage });
    toast.success("Post has been updated!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update post");
  }
};

export const deletePost = async (id) => {
  let docToDelete = doc(postsRef, id);
  try {
    await deleteDoc(docToDelete);
    toast.success("Post has been deleted!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete post");
  }
};
