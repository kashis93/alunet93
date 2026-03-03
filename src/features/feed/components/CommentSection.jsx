import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Heart, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';

const CommentSection = ({ postId, comments, onClose, onAddComment }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef(null);
  const [localComments, setLocalComments] = useState(comments || []);

  useEffect(() => {
    setLocalComments(comments || []);
  }, [comments]);

  useEffect(() => {
    scrollToBottom();
  }, [localComments]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        id: Date.now().toString(), // Temporary ID, replace with Firestore ID
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        createdAt: new Date(),
        likes: []
      };

      await onAddComment(postId, newComment.trim());
      setNewComment('');
      
      // Optimistically add comment to local state
      setLocalComments(prev => [...prev, commentData]);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    // Implementation for liking comments
    console.log('Like comment:', commentId);
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">
          Comments ({localComments.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {localComments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="font-medium">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {localComments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex space-x-3">
                  {/* User Avatar */}
                  <img
                    src={comment.authorPhoto || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`}
                    alt={comment.authorName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      {/* Author Info */}
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {comment.authorName}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(comment.createdAt?.toDate(), { addSuffix: true })}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Comment Text */}
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>

                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4 mt-1 px-1">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors group"
                      >
                        <Heart className="w-3.5 h-3.5 group-hover:fill-current" />
                        <span>Like</span>
                        {comment.likes?.length > 0 && (
                          <span className="text-gray-400">({comment.likes.length})</span>
                        )}
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        Reply
                      </button>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(comment.createdAt?.toDate(), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div className="border-t border-gray-100 p-4">
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
            alt={user?.displayName}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed ml-2 transition-colors"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
