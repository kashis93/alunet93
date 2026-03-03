import React, { useState } from 'react';
import { X, Upload, Trophy, Star, TrendingUp, Calendar, MapPin, Briefcase } from 'lucide-react';
import { uploadPostImage } from '../../../services/imageUploadAPI';
import { useAuth } from '../../../contexts/AuthContext';

const CreateAchievement = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    achievementTitle: '',
    achievementType: 'milestone',
    achievementDetails: '',
    content: '',
    company: '',
    position: '',
    location: '',
    date: ''
  });

  const achievementTypes = [
    { value: 'milestone', label: 'Career Milestone', icon: TrendingUp, color: 'green' },
    { value: 'award', label: 'Award & Recognition', icon: Star, color: 'blue' },
    { value: 'promotion', label: 'Promotion', icon: Trophy, color: 'yellow' },
    { value: 'achievement', label: 'Personal Achievement', icon: Trophy, color: 'purple' }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      const result = await uploadPostImage(file, setImagePreview, setProgress);
      setFormData(prev => ({ ...prev, image: result.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Please share your achievement details');
      return;
    }

    setLoading(true);

    try {
      const newPost = {
        ...formData,
        id: Date.now().toString(),
        authorName: user?.displayName,
        authorId: user?.uid,
        authorPhoto: user?.photoURL,
        authorRole: user?.role || 'Alumni',
        createdAt: new Date(),
        likes: [],
        comments: []
      };

      onPostCreated(newPost);
      
      // Reset form
      setFormData({
        achievementTitle: '',
        achievementType: 'milestone',
        achievementDetails: '',
        content: '',
        company: '',
        position: '',
        location: '',
        date: ''
      });
      setImagePreview(null);
      setProgress(0);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to share achievement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = achievementTypes.find(type => type.value === formData.achievementType);

  return (
    <>
      {/* Create Post Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
            alt={user?.displayName}
            className="w-10 h-10 rounded-full"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 placeholder-gray-500 transition-colors"
          >
            Share an achievement, milestone, or success... 🎉
          </button>
        </div>
      </div>

      {/* Achievement Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Share Your Achievement</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Achievement Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Achievement Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {achievementTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, achievementType: type.value }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.achievementType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mx-auto mb-2 text-${type.color}-500`} />
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Achievement Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Achievement Title</label>
                <input
                  type="text"
                  value={formData.achievementTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievementTitle: e.target.value }))}
                  placeholder="e.g., Promoted to Senior Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Achievement Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Achievement Details</label>
                <textarea
                  value={formData.achievementDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievementDetails: e.target.value }))}
                  placeholder="Describe your achievement and what it means to you..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Main Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Your Story</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tell your alumni network about your achievement, what you learned, and your journey..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., Google, Microsoft, Startup"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Photo (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="hidden"
                    id="achievement-image"
                  />
                  <label htmlFor="achievement-image" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg object-cover"
                        />
                        <p className="text-sm text-gray-600">Click to change photo</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          {loading ? 'Uploading...' : 'Click to upload photo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Progress Bar */}
                {loading && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.content.trim()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sharing...' : 'Share Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAchievement;
