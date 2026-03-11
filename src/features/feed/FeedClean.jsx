import React, { useState, useEffect, useRef } from 'react';
import { Plus, TrendingUp, Users, Calendar, Hash, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, Image as ImageIcon, MapPin, User, X, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { sendConnectionRequest, subscribeToConnections, subscribeToOutgoingRequests } from '@/services/socialService';
import { uploadImageToFirebase, deleteFileByUrl } from '@/utils/firebaseUpload.js';
import { toast } from 'sonner';

import { useNotifications } from '@/contexts/NotificationContext.jsx';

const FeedClean = () => {
  const { user } = useAuth();
  const { suggestions, activities: networkActivities } = useNotifications();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', images: [], imageFiles: [], video: null, videoFile: null });
  const [commentInputs, setCommentInputs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const [carouselIndex, setCarouselIndex] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const renderPostContent = (content) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {part}
          </a>
        );
      }
      return part;
    });
  };
  const toJSDate = (v) => {
    try {
      if (!v) return new Date();
      if (typeof v.toDate === 'function') {
        const d = v.toDate();
        return isNaN(d.getTime()) ? new Date() : d;
      }
      const d = v instanceof Date ? v : new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const handleDeletePost = async (post) => {
    if (!user || user.uid !== post.authorId) return;
    const ok = window.confirm('Delete this post? This cannot be undone.');
    if (!ok) return;
    try {
      if (Array.isArray(post.images)) {
        for (const url of post.images) await deleteFileByUrl(url).catch(() => { });
      }
      if (post.image) await deleteFileByUrl(post.image).catch(() => { });
      if (post.video) await deleteFileByUrl(post.video).catch(() => { });
      await deleteDoc(doc(db, 'posts', post.id));
    } catch (e) {
      console.error('Delete post failed:', e);
    }
  };

  // Fetch posts from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setPosts(postsData);
      setFilteredPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Track connections state for current user to drive button labels
  useEffect(() => {
    if (!user?.uid) return;
    const unsubConnected = subscribeToConnections(user.uid, (cons) => {
      const ids = new Set(cons.map(c => c.partnerId));
      setConnectedIds(ids);
    });
    const unsubOutgoing = subscribeToOutgoingRequests(user.uid, (reqs) => {
      const pend = new Set(reqs.filter(r => r.status === 'pending').map(r => r.toId));
      setPendingIds(pend);
    });
    return () => {
      unsubConnected && unsubConnected();
      unsubOutgoing && unsubOutgoing();
    };
  }, [user?.uid]);

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post =>
      post.content?.toLowerCase().includes(query) ||
      post.authorName?.toLowerCase().includes(query) ||
      post.authorCompany?.toLowerCase().includes(query) ||
      post.authorRole?.toLowerCase().includes(query)
    );

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  // Search alumni and posts
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const searchQuery = query.toLowerCase();

    try {
      // Search in posts
      const postResults = posts.filter(post =>
        post.content?.toLowerCase().includes(searchQuery) ||
        post.authorName?.toLowerCase().includes(searchQuery) ||
        post.authorCompany?.toLowerCase().includes(searchQuery)
      );

      // Search in users (alumni)
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
      );

      // Note: This is a simplified search. For production, consider using Algolia or similar
      const userResults = [
        { id: 'user1', name: 'Sarah Johnson', role: 'Software Engineer', company: 'Google', photoURL: null },
        { id: 'user2', name: 'Michael Chen', role: 'Product Manager', company: 'Microsoft', photoURL: null },
        { id: 'user3', name: 'Emily Davis', role: 'UX Designer', company: 'Apple', photoURL: null }
      ].filter(user =>
        user.name.toLowerCase().includes(searchQuery) ||
        user.role.toLowerCase().includes(searchQuery) ||
        user.company.toLowerCase().includes(searchQuery)
      );

      setSearchResults([
        ...postResults.map(post => ({
          type: 'post',
          id: post.id,
          title: post.content.substring(0, 50) + '...',
          subtitle: `By ${post.authorName}`,
          data: post
        })),
        ...userResults.map(user => ({
          type: 'user',
          id: user.id,
          title: user.name,
          subtitle: `${user.role} at ${user.company}`,
          data: user
        }))
      ]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.content.trim() && newPost.images.length === 0 && !newPost.video) return;

    try {
      let imageUrls = [];
      let videoUrl = null;

      if (newPost.imageFiles && newPost.imageFiles.length > 0) {
        const uploads = await Promise.all(
          newPost.imageFiles.slice(0, 10).map((file) => uploadImageToFirebase(file, 'posts/images'))
        );
        imageUrls = uploads.map(u => u.url).filter(Boolean);
      }

      if (newPost.videoFile) {
        const up = await uploadImageToFirebase(newPost.videoFile, 'posts/videos');
        videoUrl = up?.url || null;
      }

      const postData = {
        content: newPost.content,
        authorId: user.uid,
        authorName: user.displayName || user.name || 'Anonymous',
        authorPhoto: user.photoURL,
        authorRole: 'Alumni',
        authorCompany: user.company || '',
        likes: [],
        comments: [],
        shares: 0,
        saves: [],
        createdAt: serverTimestamp(),
        ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
        ...(videoUrl ? { video: videoUrl } : {})
      };

      await addDoc(collection(db, 'posts'), postData);
      setNewPost({ content: '', images: [], imageFiles: [], video: null, videoFile: null });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Like post
  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      if (!postId) {
        console.error('No postId provided');
        return;
      }

      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);

      if (!post) {
        console.error('Post not found locally:', postId);
        // Fallback: try direct fetch if local post is stale
        const snap = await getDoc(postRef);
        if (snap.exists()) {
          const remoteLikes = snap.data().likes || [];
          if (remoteLikes.includes(user.uid)) {
            await updateDoc(postRef, { likes: arrayRemove(user.uid) });
          } else {
            await updateDoc(postRef, { likes: arrayUnion(user.uid) });
          }
        } else {
          toast.error('Post not found.');
        }
        return;
      }

      const likes = Array.isArray(post.likes) ? post.likes : [];
      const isLiked = likes.includes(user.uid);

      if (isLiked) {
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
      toast.error('Unable to update like. Please try again.');
    }
  };

  // Add comment
  const handleAddComment = async (postId) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const commentData = {
        id: Math.random().toString(36).substr(2, 9),
        content: commentText.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.name || 'Anonymous',
        authorPhoto: user.photoURL,
        createdAt: new Date().toISOString(),
        likes: []
      };

      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // Save post
  const handleSavePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);

      if (post.saves?.includes(user.uid)) {
        await updateDoc(postRef, {
          saves: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          saves: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  // Share post
  const handleSharePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        shares: (posts.find(p => p.id === postId)?.shares || 0) + 1
      });

      if (navigator.share) {
        navigator.share({
          title: 'Check out this post',
          text: posts.find(p => p.id === postId)?.content,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length) {
      const readers = imageFiles.map(f => new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result);
        r.readAsDataURL(f);
      }));
      Promise.all(readers).then((dataUrls) => {
        setNewPost(prev => ({
          ...prev,
          images: [...prev.images, ...dataUrls].slice(0, 10),
          imageFiles: [...prev.imageFiles, ...imageFiles].slice(0, 10),
          video: null,
          videoFile: null
        }));
      });
    }
  };
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({ ...prev, video: reader.result, videoFile: file, images: [], imageFiles: [] }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    if (result.type === 'user') {
      // Navigate to user profile
      window.location.href = `/profile/${result.id}`;
    } else if (result.type === 'post') {
      // Scroll to post or highlight it
      const postElement = document.getElementById(`post-${result.id}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
        postElement.classList.add('ring-2', 'ring-purple-500');
        setTimeout(() => {
          postElement.classList.remove('ring-2', 'ring-purple-500');
        }, 2000);
      }
    }
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white/95 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">

            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Community Feed
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* Left Sidebar - Profile Summary */}
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="-mt-10 px-4 pb-6 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-blue-600 text-white font-black text-xl">
                  {user?.displayName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <h3 className="font-black text-lg text-slate-900">{user?.displayName || 'User'}</h3>
                <p className="text-sm text-slate-500 font-medium">{user?.role || 'Alumni'} • {user?.department || 'CSE'}</p>
                <p className="text-[11px] text-blue-600 font-bold mt-1">{user?.company || 'ConnectVerse'}</p>
              </div>
              <div className="w-full h-px bg-slate-100 my-4"></div>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition">
                  <span>Profile Visitors</span>
                  <span className="text-blue-600">42</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition">
                  <span>Post Impressions</span>
                  <span className="text-blue-600">1.2k</span>
                </div>
              </div>
              <div className="w-full h-px bg-slate-100 my-4"></div>
              <Link to="/profile" className="text-blue-600 hover:text-blue-800 text-xs font-black uppercase tracking-widest transition">
                View My Profile
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-[420px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trending Tags</p>
            <div className="flex flex-wrap gap-2">
              {['#AI', '#Web3', '#Hiring', '#Career', '#OpenSource'].map(tag => (
                <span key={tag} className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Feed Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          {/* Modern LinkedIn-Style Create Post Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 transition-all hover:shadow-md group">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-slate-50">
                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg">
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-full px-5 py-3 text-gray-500 text-sm font-medium cursor-pointer transition-all border border-gray-200/50 hover:border-blue-200"
              >
                What's on your mind, {user?.displayName?.split(' ')[0] || 'Alumni'}?
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <button
                onClick={() => { setShowCreatePost(true); setTimeout(() => imageInputRef.current?.click(), 100); }}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-purple-50 rounded-lg transition-colors group"
              >
                <ImageIcon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 text-sm font-semibold">Photo</span>
              </button>
              <button
                onClick={() => { setShowCreatePost(true); setTimeout(() => videoInputRef.current?.click(), 100); }}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-green-50 rounded-lg transition-colors group"
              >
                <Video className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 text-sm font-semibold">Video</span>
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors group"
              >
                <Calendar className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 text-sm font-semibold">Event</span>
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} id={`post-${post.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Link to={`/profile/${post.authorId}`} className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.authorPhoto} alt={post.authorName} />
                          <AvatarFallback>{post.authorName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link to={`/profile/${post.authorId}`} className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors">
                            {post.authorName}
                          </Link>
                          {post.authorRole && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                              {post.authorRole}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{post.authorCompany}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(toJSDate(post.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.uid !== post.authorId && (
                        connectedIds.has(post.authorId) ? (
                          <Link to={`/chat/${[user.uid, post.authorId].sort().join("_")}`}>
                            <Button size="sm">Message</Button>
                          </Link>
                        ) : pendingIds.has(post.authorId) ? (
                          <Button size="sm" variant="outline" disabled>Requested</Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await sendConnectionRequest(user, post.authorId);
                                setPendingIds(prev => new Set(prev).add(post.authorId));
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            Connect
                          </Button>
                        )
                      )}
                      {user?.uid === post.authorId && (
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                          title="Delete post"
                        >
                          <MoreHorizontal className="w-5 h-5 rotate-90" />
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-5 pt-2">
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {renderPostContent(post.content)}
                    </p>
                  </div>

                  {/* Post Media */}
                  {Array.isArray(post.images) && post.images.length > 0 ? (
                    <div className="relative w-full bg-black">
                      {(() => {
                        const count = post.images.length;
                        const idx = carouselIndex[post.id] ?? 0;
                        const safeIdx = ((idx % count) + count) % count;
                        return (
                          <>
                            <img
                              src={post.images[safeIdx]}
                              alt={`Post image ${safeIdx + 1} of ${count}`}
                              className="w-full max-h-[600px] object-contain bg-black"
                            />
                            {count > 1 && (
                              <>
                                <button
                                  onClick={() =>
                                    setCarouselIndex(prev => ({
                                      ...prev,
                                      [post.id]: ((safeIdx - 1 + count) % count)
                                    }))
                                  }
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                  aria-label="Previous image"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setCarouselIndex(prev => ({
                                      ...prev,
                                      [post.id]: ((safeIdx + 1) % count)
                                    }))
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                  aria-label="Next image"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                  {post.images.map((_, i) => (
                                    <span
                                      key={i}
                                      className={`h-2 w-2 rounded-full ${i === safeIdx ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : post.image ? (
                    <div className="w-full">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full object-cover max-h-[600px]"
                      />
                    </div>
                  ) : post.video ? (
                    <div className="w-full">
                      <video
                        src={post.video}
                        controls
                        className="w-full max-h-[600px] bg-black"
                      />
                    </div>
                  ) : null}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-1 transition-colors ${post.likes?.includes(user?.uid) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                            }`}
                        >
                          <Heart className={`h-5 w-5 ${post.likes?.includes(user?.uid) ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
                          className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => handleSharePost(post.id)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          <Share2 className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.shares || 0}</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSavePost(post.id)}
                        className={`transition-colors ${post.saves?.includes(user?.uid) ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                          }`}
                      >
                        <Bookmark className={`h-5 w-5 ${post.saves?.includes(user?.uid) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Like Count */}
                    {post.likes && post.likes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900">
                          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                        </p>
                      </div>
                    )}

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 mb-3">
                        {post.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="flex space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.authorPhoto} alt={comment.authorName} />
                              <AvatarFallback className="text-xs">{comment.authorName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(toJSDate(comment.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 2 && (
                          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View all {post.comments.length} comments
                          </button>
                        )}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                        <AvatarFallback className="text-xs">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2">
                        <Input
                          id={`comment-input-${post.id}`}
                          placeholder="Add a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="border-0 bg-transparent focus:ring-0 text-sm flex-1 px-0"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                          <Smile className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No results found' : 'No posts yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? `Try searching for different keywords or alumni names`
                      : 'Be the first to share something with the community!'
                    }
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Suggestions & Network */}
        <div className="hidden xl:block w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900">Add to your feed</h3>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-4">
              {suggestions.slice(0, 3).map(sug => (
                <div key={sug.id} className="flex items-start gap-3 group">
                  <Link to={`/profile/${sug.id}`}>
                    <Avatar className="h-10 w-10 border border-slate-100 shadow-sm group-hover:ring-2 group-hover:ring-blue-600 transition-all">
                      <AvatarImage src={sug.photoURL} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                        {sug.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${sug.id}`}>
                      <p className="text-sm font-black text-slate-900 truncate hover:text-blue-600 transition">{sug.name}</p>
                    </Link>
                    <p className="text-[10px] text-slate-500 font-medium truncate mb-2">{sug.role} • {sug.company || 'Alumni'}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full font-black text-[10px] border-slate-300 hover:bg-slate-50 hover:text-blue-600 transition-all w-full"
                      onClick={() => sendConnectionRequest(user, sug.id)}
                      disabled={pendingIds.has(sug.id) || connectedIds.has(sug.id)}
                    >
                      {connectedIds.has(sug.id) ? 'Connected' : pendingIds.has(sug.id) ? 'Requested' : '+ Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/directory" className="mt-6 block text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition">
              View all recommendations
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-[440px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Network Activity</p>
            <div className="space-y-4">
              {networkActivities.slice(0, 3).map(act => (
                <div key={act.id} className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-snug">
                    <span className="font-black text-slate-900">{act.authorName}</span> shared <b>{act.title}</b>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50/50">
            <DialogTitle className="text-xl font-black text-slate-900">Create Post</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                <AvatarFallback className="bg-blue-600 text-white font-bold">{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-black text-slate-900">{user?.displayName || 'User'}</h3>
                <p className="text-xs text-slate-500 font-medium">{user?.role || 'Alumni'} • {user?.company || 'ConnectVerse'}</p>
              </div>
            </div>

            <textarea
              placeholder="What do you want to talk about?"
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="w-full min-h-[150px] p-0 border-none resize-none focus:ring-0 text-lg text-slate-800 placeholder:text-slate-400"
            />

            {newPost.video ? (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video src={newPost.video} controls className="w-full max-h-[300px]" />
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, video: null, videoFile: null }))}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : newPost.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {newPost.images.slice(0, 4).map((src, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-100">
                    <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setNewPost(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                        imageFiles: prev.imageFiles.filter((_, i) => i !== idx)
                      }))}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {idx === 3 && newPost.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-xl">
                        +{newPost.images.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex space-x-2">
                <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                <button onClick={() => imageInputRef.current?.click()} className="p-2.5 hover:bg-blue-50 rounded-full transition-colors group">
                  <ImageIcon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => videoInputRef.current?.click()} className="p-2.5 hover:bg-green-50 rounded-full transition-colors group">
                  <Video className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <div className="flex space-x-3">
                <Button variant="ghost" onClick={() => setShowCreatePost(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.content.trim() && newPost.images.length === 0 && !newPost.video}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-black shadow-lg shadow-blue-200"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedClean;
