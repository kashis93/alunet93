// Cloudinary upload configuration using fetch
import { Cloudinary } from '@cloudinary/url-gen';

// Create a Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz'
  }
});

export const uploadImage = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alumni_uploads';
  
  console.log('Upload config:', { cloudName, uploadPreset });
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'alumni-platform/profiles');

  try {
    console.log('Starting upload to Cloudinary...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upload failed response:', errorData);
      
      // Provide more specific error messages
      if (errorData.error?.message?.includes('Upload preset')) {
        throw new Error('Upload preset not found. Please check Cloudinary configuration.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Check API credentials.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Check upload permissions.');
      } else if (response.status === 404) {
        throw new Error('Cloud name not found or upload preset missing.');
      } else {
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alumni_uploads'
        })
      }
    );

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

// Get optimized image URL
export const getOptimizedUrl = (publicId, options = {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
    ...options
  };

  const params = new URLSearchParams(defaultOptions).toString();
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}`;
};

// Get transformed image URL (crop, resize, etc.)
export const getTransformedUrl = (publicId, options = {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  const defaultOptions = {
    crop: 'auto',
    gravity: 'auto',
    width: 500,
    height: 500,
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
    ...options
  };

  const params = new URLSearchParams(defaultOptions).toString();
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}`;
};
