import React, { useState } from 'react';
import { uploadImage } from '../utils/cloudinary';

const CloudinaryTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const testUpload = async () => {
    // Create a simple test image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, 100, 100);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setUploading(true);
      setError(null);
      setResult(null);
      
      try {
        const uploadResult = await uploadImage(blob);
        setResult(uploadResult);
        console.log('Test upload successful:', uploadResult);
      } catch (err) {
        setError(err.message);
        console.error('Test upload failed:', err);
      } finally {
        setUploading(false);
      }
    }, 'image/png');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Cloudinary Upload Test</h2>
      
      <button
        onClick={testUpload}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {uploading ? 'Testing...' : 'Test Upload'}
      </button>
      
      {uploading && <p className="mt-2 text-blue-600">Testing upload...</p>}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <h3 className="font-bold text-red-700">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <h3 className="font-bold text-green-700">Success!</h3>
          <p className="text-sm text-green-600">URL: {result.url}</p>
          <p className="text-sm text-green-600">Public ID: {result.publicId}</p>
          {result.url && (
            <img src={result.url} alt="Test upload" className="mt-2 w-20 h-20 object-cover" />
          )}
        </div>
      )}
    </div>
  );
};

export default CloudinaryTest;
