import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../../../utils/cloudinary';
import { useAuth } from '../../../contexts/AuthContext';
import CommentSection from './CommentSection';

const PostCard = ({ post, onLike, onComment, onShare }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = post.likes?.includes(user?.uid);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await onComment(post.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.authorName}'s post`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    onShare?.(post.id);
  };

  const getImageUrl = (imageData) => {
    if (!imageData?.url) return null;
    
    const img = cld.image(imageData.publicId);
    img.resize(fill().width(800).height(600));
    return img;
  };

  const topComments = post.comments?.slice(0, 2) || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 mb-4">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <img
              src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`}
              alt={post.authorName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                  {post.authorName}
                </h3>
                {post.authorRole && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.authorRole === 'Alumni' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {post.authorRole}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{post.authorTitle}</span>
                {post.authorCompany && <span>• {post.authorCompany}</span>}
                <span>•</span>
                <span>{formatDistanceToNow(post.createdAt?.toDate(), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative bg-gray-100">
          <AdvancedImage
            cldImg={getImageUrl(post.image)}
            className="w-full object-cover max-h-[600px]"
            alt="Post image"
          />
        </div>
      )}

      {/* Engagement Bar */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {likeCount > 0 && (
              <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <div className="flex -space-x-1">
                  {[...Array(Math.min(3, likeCount))].map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <Heart className="w-2.5 h-2.5 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <span>{likeCount}</span>
              </button>
            )}
            {commentCount > 0 && (
              <button 
                onClick={() => setShowComments(!showComments)}
                className="hover:text-blue-600 transition-colors"
              >
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-around">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isLiked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showComments
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comment Preview */}
      {topComments.length > 0 && !showComments && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="space-y-2">
            {topComments.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <img
                  src={comment.authorPhoto || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`}
                  alt={comment.authorName}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
            {commentCount > 2 && (
              <button
                onClick={() => setShowComments(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all {commentCount} comments
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Comment */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
            alt={user?.displayName}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed ml-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Comment Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          onClose={() => setShowComments(false)}
          onAddComment={onComment}
        />
      )}
    </div>
  );
};

export default PostCard;
