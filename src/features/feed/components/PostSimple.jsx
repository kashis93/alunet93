import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const PostSimple = ({ post }) => {
  console.log('PostSimple rendering:', post);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center space-x-3 mb-3">
        <img
          src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`}
          alt={post.authorName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
          <p className="text-xs text-gray-500">{post.authorRole}</p>
        </div>
        <button className="ml-auto">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-900 text-sm">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt="Post image"
            className="w-full h-auto max-h-60 object-contain"
          />
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600">
          <Heart className="w-4 h-4" />
          <span>{post.likes?.length || 0}</span>
        </button>
        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostSimple;
