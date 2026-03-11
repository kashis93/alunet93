import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

// Fallback upload using Firebase Storage
export const uploadImageToFirebase = async (file, folder = 'profile-photos') => {
  try {
    console.log('Starting Firebase upload...');
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}_${file.name}`;
    
    const storageRef = ref(storage, filename);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Firebase upload successful:', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Firebase download URL:', downloadURL);
    
    return {
      url: downloadURL,
      publicId: filename,
      width: null, // Firebase doesn't provide dimensions
      height: null
    };
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error(`Firebase upload failed: ${error.message}`);
  }
};

// Best-effort delete a file in Firebase Storage using its download URL
export const deleteFileByUrl = async (url) => {
  try {
    if (!url || typeof url !== 'string') return false;
    // Parse gs path from the public URL: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?...
    const match = url.match(/https?:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/);
    if (!match) return false;
    const path = decodeURIComponent(match[1]);
    const r = ref(storage, path);
    // Dynamic import to avoid tree-shaking issues
    const { deleteObject } = await import('firebase/storage');
    await deleteObject(r);
    return true;
  } catch (error) {
    console.warn('deleteFileByUrl failed (ignored):', error);
    return false;
  }
};
