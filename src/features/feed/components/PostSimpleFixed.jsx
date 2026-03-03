import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const PostSimpleFixed = ({ post }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      // Initialize likes and comments from post data
      setLikes(post.likes || []);
      setComments(post.comments || []);
      setLikeCount(post.likes?.length || 0);
      setCommentCount(post.comments?.length || 0);
      
      // Check if current user liked this post
      if (user && post.likes) {
        setIsLiked(post.likes.includes(user.uid));
      }
    }
  }, [post, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setLoading(true);
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
      toast.success(newIsLiked ? 'Post liked!' : 'Like removed');

      // Save like to Firebase
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        likes: newIsLiked ? [...(likes || []), { userId: user.uid, timestamp: new Date() }] : (likes || []).filter(like => like.userId !== user.uid),
        likeCount: newIsLiked ? likeCount + 1 : likeCount - 1,
        updatedAt: new Date()
      });
      // For now, we'll just update the local state
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
      // Revert state on error
      setIsLiked(!isLiked);
      setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const commentData = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        content: newComment.trim(),
        createdAt: new Date(),
        likes: []
      };

      const newComments = [...comments, commentData];
      setComments(newComments);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      toast.success('Comment added!');

      // Save comment to Firebase
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        comments: newComments,
        commentCount: commentCount + 1,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.authorName}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center space-x-3 mb-3">
        <img
          src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`}
          alt={post.authorName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
          <p className="text-xs text-gray-500">
            {post.authorRole} • {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
          </p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-900 text-sm whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt="Post image"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {/* Engagement Stats */}
      {(likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
          {likeCount > 0 && (
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          )}
          {commentCount > 0 && (
            <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
      )}

      {/* Engagement Buttons */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            isLiked 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-gray-600 hover:bg-gray-100'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{commentCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Add Comment */}
          {user && (
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-2">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <img
                    src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 text-sm">{comment.userName}</h4>
                      <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostSimpleFixed;
