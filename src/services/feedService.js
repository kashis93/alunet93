import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  increment 
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Firestore Collections Structure:
// posts/{postId}
// ├── content: string
// ├── authorId: string
// ├── authorName: string
// ├── authorPhoto: string
// ├── authorRole: string (Alumni/Student)
// ├── authorTitle: string
// ├── authorCompany: string
// ├── image: {
// │   url: string,
// │   publicId: string,
// │   width: number,
// │   height: number
// │ }
// ├── createdAt: timestamp
// ├── updatedAt: timestamp
// ├── likes: array of userIds
// ├── comments: array of comment objects
// ├── shares: number
// ├── tags: array of strings (hashtags)
// └── visibility: string (public/alumni/private)

// Comments substructure (stored as array in post):
// {
//   id: string,
//   content: string,
//   authorId: string,
//   authorName: string,
//   authorPhoto: string,
//   createdAt: timestamp,
//   likes: array of userIds,
//   replies: array of reply objects
// }

class FeedService {
  // Create a new post
  static async createPost(postData) {
    try {
      const postWithTimestamp = {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        comments: [],
        shares: 0,
        tags: this.extractHashtags(postData.content)
      };

      const docRef = await addDoc(collection(db, 'posts'), postWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Get posts with real-time updates
  static getPostsRealtime(callback, options = {}) {
    const {
      limit: limitCount = 20,
      authorId,
      authorRole,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    let q = query(
      collection(db, 'posts'),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    // Add filters if provided
    if (authorId) {
      q = query(q, where('authorId', '==', authorId));
    }
    if (authorRole) {
      q = query(q, where('authorRole', '==', authorRole));
    }

    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    }, (error) => {
      console.error('Error fetching posts:', error);
      callback([]);
    });
  }

  // Get single post
  static async getPost(postId) {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        return { id: postDoc.id, ...postDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  // Update post
  static async updatePost(postId, updateData) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Delete post
  static async deletePost(postId) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Like/Unlike post
  static async toggleLike(postId, userId) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const likes = postDoc.data().likes || [];
      const isLiked = likes.includes(userId);

      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId)
        });
      }

      return !isLiked; // Return new like status
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Add comment to post
  static async addComment(postId, commentData) {
    try {
      const postRef = doc(db, 'posts', postId);
      const commentWithTimestamp = {
        ...commentData,
        id: Date.now().toString(), // Generate unique ID
        createdAt: serverTimestamp(),
        likes: [],
        replies: []
      };

      await updateDoc(postRef, {
        comments: arrayUnion(commentWithTimestamp),
        updatedAt: serverTimestamp()
      });

      return commentWithTimestamp.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Like/Unlike comment
  static async toggleCommentLike(postId, commentId, userId) {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const comments = postDoc.data().comments || [];
      const commentIndex = comments.findIndex(c => c.id === commentId);
      
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }

      const comment = comments[commentIndex];
      const likes = comment.likes || [];
      const isLiked = likes.includes(userId);

      if (isLiked) {
        comment.likes = likes.filter(id => id !== userId);
      } else {
        comment.likes.push(userId);
      }

      // Update the entire comments array
      const updatedComments = [...comments];
      updatedComments[commentIndex] = comment;

      await updateDoc(doc(db, 'posts', postId), {
        comments: updatedComments,
        updatedAt: serverTimestamp()
      });

      return !isLiked; // Return new like status
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  // Share post (increment share count)
  static async sharePost(postId) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        shares: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  // Get posts by user
  static getUserPosts(userId, callback) {
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    }, (error) => {
      console.error('Error fetching user posts:', error);
      callback([]);
    });
  }

  // Search posts by content or tags
  static searchPosts(searchTerm, callback) {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      callback(posts);
    }, (error) => {
      console.error('Error searching posts:', error);
      callback([]);
    });
  }

  // Extract hashtags from content
  static extractHashtags(content) {
    const hashtags = content.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1).toLowerCase());
  }

  // Get trending hashtags
  static async getTrendingHashtags() {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const allTags = [];
      
      snapshot.docs.forEach(doc => {
        const tags = doc.data().tags || [];
        allTags.push(...tags);
      });

      // Count occurrences
      const tagCounts = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Sort by count and return top 10
      return Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));
    } catch (error) {
      console.error('Error getting trending hashtags:', error);
      return [];
    }
  }
}

export default FeedService;
