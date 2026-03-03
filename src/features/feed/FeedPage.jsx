import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, Calendar, Hash } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch posts from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create new post
  const handleCreatePost = async (postData) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  // Like post
  const handleLikePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      
      if (post.likes?.includes(user.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Add comment
  const handleAddComment = async (postId, commentText) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const commentData = {
        id: Date.now().toString(), // Temporary ID
        content: commentText,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        createdAt: new Date(),
        likes: []
      };

      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Share post
  const handleSharePost = async (postId) => {
    try {
      // Implement share logic (e.g., create a notification, track shares)
      console.log('Post shared:', postId);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'alumni') return post.authorRole === 'Alumni';
    if (activeTab === 'students') return post.authorRole === 'Student';
    return true;
  });

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'all', label: 'All Posts', icon: TrendingUp },
                  { id: 'alumni', label: 'Alumni', icon: Users },
                  { id: 'students', label: 'Students', icon: Calendar },
                  { id: 'trending', label: 'Trending', icon: Hash }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLikePost}
                    onComment={handleAddComment}
                    onShare={handleSharePost}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="font-semibold text-gray-900">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold text-gray-900">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Today</span>
                  <span className="font-semibold text-green-600">+12</span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {['#alumni2024', '#networking', '#careers', '#innovation'].map((topic, index) => (
                  <button
                    key={topic}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span className="text-gray-400">#{index + 1}</span>
                    <span>{topic.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Alumni Meetup</p>
                    <p className="text-xs text-gray-600">Dec 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Career Fair</p>
                    <p className="text-xs text-gray-600">Dec 20, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <CreatePost
              onPostCreate={handleCreatePost}
              onClose={() => setShowCreatePost(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
