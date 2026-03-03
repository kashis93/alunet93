import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, X, Edit, Trash2, Flag, Trophy, Star, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { setupLikeListener, toggleLike } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AchievementPost = ({ post, onLike, onComment, onShare, currentUser }) => {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.uid) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Set up real-time like listener
  useEffect(() => {
    if (!post?.id || !currentUser?.uid) return;
    
    const unsubscribe = setupLikeListener(post.id, setLikeCount, setLiked, currentUser.uid);
    return unsubscribe;
  }, [post?.id, currentUser?.uid]);

  const handleLike = async () => {
    if (!currentUser) return;
    
    try {
      await toggleLike(post.id, currentUser.uid, liked, setLikeCount, setLiked);
      onLike(post.id, !liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      author: currentUser?.displayName,
      authorId: currentUser?.uid,
      authorPhoto: currentUser?.photoURL,
      text: commentText,
      createdAt: new Date(),
      likes: []
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    onComment(post.id, newComment);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.authorId}`);
  };

  const handleDropdownAction = (action) => {
    setShowDropdown(false);
    switch (action) {
      case 'edit':
        toast.info('Edit functionality coming soon');
        break;
      case 'delete':
        toast.info('Delete functionality coming soon');
        break;
      case 'report':
        toast.info('Report functionality coming soon');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 max-w-2xl mx-auto">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <img
              src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`}
              alt={post.authorName}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 
                  className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleProfileClick}
                >
                  {post.authorName}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  post.authorRole === 'Alumni' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {post.authorRole}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="relative">
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {post.authorId === currentUser?.uid && (
                    <>
                      <button
                        onClick={() => handleDropdownAction('edit')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Post
                      </button>
                      <button
                        onClick={() => handleDropdownAction('delete')}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDropdownAction('report')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        {/* Description/Caption */}
        <div className="mb-3">
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
            {post.content}
          </p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={post.image}
              alt="Post image"
              className="w-full h-auto max-h-60 object-contain hover:scale-105 transition-transform duration-300"
              style={{ maxHeight: '240px', width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                liked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments.length}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => onShare(post)}
              className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-6 py-4">
          {/* Add Comment */}
          <div className="flex space-x-3 mb-4">
            <img
              src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=random`}
              alt={currentUser?.displayName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.slice(0, 3).map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <img
                  src={comment.authorPhoto || `https://ui-avatars.com/api/?name=${comment.author}&background=random`}
                  alt={comment.author}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{comment.author}</h4>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length > 3 && (
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all {comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementPost;
