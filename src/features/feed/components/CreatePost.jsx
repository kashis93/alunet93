import React, { useState, useRef } from 'react';
import { X, Image, Calendar, Hash, Smile, Send } from 'lucide-react';
import { uploadPostImage } from '../../../services/imageUploadAPI';
import { notifyConnectedAlumni } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

const CreatePost = ({ onPostCreate, onClose }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [postImageUrl, setPostImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPostImageUrl(null); // Clear post image URL
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !selectedImage) {
      toast.error('Please add some content or an image');
      return;
    }

    setIsPosting(true);

    try {
      let imageData = null;

      // Upload image if selected using the new service with fallback
      if (selectedImage) {
        setIsUploading(true);
        try {
          imageData = await uploadPostImage(selectedImage, setPostImageUrl, (progress) => {
            console.log(`Upload progress: ${progress}%`);
          });
        } catch (error) {
          console.error('Image upload failed:', error);
          setIsPosting(false);
          setIsUploading(false);
          return;
        }
      }

      // Create post data
      const postData = {
        id: Date.now().toString(), // Generate unique ID
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        authorRole: user.role || 'Alumni',
        authorTitle: user.title || '',
        authorCompany: user.company || '',
        image: imageData?.url || null, // Only store the URL string
        createdAt: new Date(),
        likes: [],
        comments: [],
        achievementTitle: 'Shared a post',
        achievementType: 'post',
        achievementDetails: content.trim() || 'Shared an image',
        company: user.company || '',
        position: user.role || 'Alumni',
        location: 'Ahmedabad, India',
        date: new Date().toISOString().split('T')[0]
      };

      await onPostCreate(postData);

      // Send notifications to connected alumni
      try {
        await notifyConnectedAlumni(
          user.uid,
          user.displayName,
          content.trim(),
          postData.id
        );
        console.log('Notifications sent to connected alumni');
      } catch (error) {
        console.error('Error sending notifications:', error);
        // Don't show error to user as post was successful
      }

      // Reset form
      setContent('');
      removeImage();
      setPostImageUrl(null); // Clear post image URL
      onClose?.();

    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Create a post</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* User Info */}
        <div className="flex items-start space-x-3 mb-4">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
            alt={user?.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user?.displayName}</h3>
            <p className="text-sm text-gray-500">
              {user?.role || 'Alumni'} {user?.title && `• ${user.title}`}
              {user?.company && ` at ${user.company}`}
            </p>
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to talk about?"
            className="w-full resize-none outline-none text-gray-900 placeholder-gray-500 text-lg leading-relaxed min-h-[120px]"
            rows={4}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mb-4 rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-[400px] object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm">Uploading image...</div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <Image className="w-5 h-5" />
              <span className="text-sm font-medium">Photo</span>
            </label>

            {/* Other actions (placeholder) */}
            <button
              type="button"
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Event</span>
            </button>

            <button
              type="button"
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Hash className="w-5 h-5" />
              <span className="text-sm font-medium">Hashtag</span>
            </button>

            <button
              type="button"
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5" />
              <span className="text-sm font-medium">Feeling</span>
            </button>
          </div>

          {/* Post Button */}
          <button
            type="submit"
            disabled={isPosting || isUploading || (!content.trim() && !selectedImage)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-3 text-xs text-gray-500">
          Press Ctrl+Enter to post • Maximum image size: 10MB
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
