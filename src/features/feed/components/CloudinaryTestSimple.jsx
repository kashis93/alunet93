import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const CloudinaryTestSimple = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkCloudinaryConfig = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || cloudName === 'your_cloud_name_here') {
      return { status: 'error', message: 'Cloudinary cloud name not configured' };
    }
    
    if (!uploadPreset || uploadPreset === 'your_upload_preset_here') {
      return { status: 'error', message: 'Upload preset not configured' };
    }
    
    return { status: 'success', message: 'Cloudinary configured correctly' };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simple Cloudinary upload using fetch
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'alumni-platform/posts');

      setProgress(25);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      setProgress(75);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult({
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height
      });
      setProgress(100);
      
    } catch (err) {
      setError(err.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const configStatus = checkCloudinaryConfig();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">☁️ Cloudinary Test</h2>
      
      {/* Configuration Status */}
      <div className={`p-4 rounded-lg mb-6 ${
        configStatus.status === 'success' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          {configStatus.status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-medium ${
            configStatus.status === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {configStatus.message}
          </span>
        </div>
      </div>

      {/* Upload Test */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Image Upload
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || configStatus.status === 'error'}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ Upload Successful!</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">URL:</span>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline break-all"
                >
                  {result.url}
                </a>
              </div>
              <div>
                <span className="font-medium text-gray-700">Public ID:</span>
                <span className="ml-2 text-gray-600">{result.publicId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Dimensions:</span>
                <span className="ml-2 text-gray-600">{result.width} × {result.height}</span>
              </div>
            </div>
            <div className="mt-3">
              <img 
                src={result.url} 
                alt="Uploaded" 
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '200px' }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Upload Failed</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      {configStatus.status === 'error' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">🔧 Setup Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline">cloudinary.com</a></li>
            <li>Sign up for FREE account (25GB storage)</li>
            <li>Get your <strong>Cloud Name</strong> from Dashboard</li>
            <li>Create Upload Preset named <strong>alumni_uploads</strong></li>
            <li>Update your <code className="bg-blue-100 px-1 rounded">.env</code> file:</li>
          </ol>
          <div className="mt-3 p-3 bg-gray-800 text-green-400 rounded text-xs font-mono">
            VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name<br/>
            VITE_CLOUDINARY_UPLOAD_PRESET=alumni_uploads
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTestSimple;
