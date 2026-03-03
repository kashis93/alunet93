import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { uploadAsDataURL } from '../../../utils/dataURLUpload';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const ProfileBackground = ({ currentBackground, onBackgroundUpdate }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentBackground || null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for background
      toast.error('Background image should be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log('Starting background upload:', file.name);
      const result = await uploadAsDataURL(file);
      console.log('Background upload successful:', result);

      setProgress(100);
      setPreview(result.url);
      onBackgroundUpdate(result.url);

      // Update user profile in Firebase
      await updateDoc(doc(db, 'users', user.uid), {
        backgroundImage: result.url
      });

      toast.success('Background image updated!');
    } catch (error) {
      console.error('Background upload error:', error);
      toast.error(`Failed to upload background: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveBackground = async () => {
    try {
      // Remove from Firebase
      await updateDoc(doc(db, 'users', user.uid), {
        backgroundImage: null
      });

      setPreview(null);
      onBackgroundUpdate(null);

      toast.success('Background image removed');
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Failed to remove background image');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Profile Background</h3>
          <p className="text-sm text-gray-600">
            Add a cover photo like LinkedIn to personalize your profile
          </p>
        </div>
      </div>

      <div className="relative group">
        {/* Current Background Preview */}
        <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
          {preview ? (
            <img
              src={preview}
              alt="Profile background"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No background image</p>
              </div>
            </div>
          )}

          {/* Upload Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer">
              <div className="bg-white rounded-lg p-4 text-center">
                <Camera className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Click to upload background</p>
                <p className="text-xs text-gray-500">Recommended: 1920x1080</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Uploading background...</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Remove Button */}
        {preview && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleRemoveBackground}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Remove Background
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileBackground;
