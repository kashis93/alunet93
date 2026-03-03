import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, Calendar, Hash, Cloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CloudinaryTestSimple from './components/CloudinaryTestSimple';
import CreateAchievement from './components/CreateAchievement';
import AchievementPost from './components/AchievementPost';
import CreatePost from './components/CreatePost';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

// Real feed that loads from Firebase
const FeedPageSafe = () => {
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
    
    // Load real posts from Firebase
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
        ? { ...post, comments: [comment, ...post.comments] }
        : post
    ));
  };

  const handleShare = (post) => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: post.achievementTitle || 'Achievement',
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePostCreated = async (newPost) => {
    try {
      // Save post to Firebase activities collection (same as postsAPI uses)
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed</h1>
          <p className="text-gray-600">Stay connected with your alumni community</p>
        </div>

        {/* Cloudinary Test Section - REMOVED */}

        {/* Create Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
              alt={user?.displayName}
              className="w-10 h-10 rounded-full"
            />
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2.5 text-left text-gray-600 placeholder-gray-500 transition-colors"
            >
              Start a post...
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">New Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Achievement */}
        <CreateAchievement onPostCreated={handlePostCreated} />

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <AchievementPost
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              currentUser={user}
            />
          ))}
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <CreatePost
              onPostCreate={handlePostCreated}
              onClose={() => setShowCreatePost(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPageSafe;
