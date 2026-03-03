import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, Calendar, Hash, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CreatePost from './components/CreatePost';
import PostSimpleFixed from './components/PostSimpleFixed';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

// Clean feed that works like LinkedIn/Instagram
const FeedPageSafeFixed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Load real posts from Firebase activities collection
    const postsRef = collection(db, "activities");
    const q = query(
      postsRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = [];
      snapshot.forEach((doc) => {
        const postData = doc.data();
        postsData.push({
          id: doc.id,
          ...postData,
          createdAt: postData.createdAt?.toDate() || new Date()
        });
      });
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLike = (postId, isLiked) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: isLiked 
              ? [...post.likes, user?.uid] 
              : post.likes.filter(id => id !== user?.uid)
          }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: [...post.comments, {
              id: Date.now().toString(),
              author: user?.displayName,
              authorId: user?.uid,
              authorPhoto: user?.photoURL,
              text: comment,
              createdAt: new Date()
            }]
          }
        : post
    ));
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.achievementTitle || 'Post',
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePostCreated = async (newPost) => {
    try {
      // Save post to Firebase activities collection
      const postsRef = collection(db, "activities");
      const docRef = await addDoc(postsRef, {
        ...newPost,
        createdAt: serverTimestamp()
      });
      
      console.log("Post saved to Firebase with ID:", docRef.id);
      
      // Add to local state
      setPosts(prev => [newPost, ...prev]);
      setShowCreatePost(false);
      
      toast.success("Post published successfully!");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to publish post");
      setShowCreatePost(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Create Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
              alt={user?.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg px-4 py-3 text-sm transition-colors"
            >
              Start a post...
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 text-sm">Be the first to share something with your alumni community!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostSimpleFixed
                key={post.id}
                post={post}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <CreatePost
                onPostCreate={handlePostCreated}
                onClose={() => setShowCreatePost(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPageSafeFixed;
