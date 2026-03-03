// Cloudinary Configuration Verification
// Run this in browser console on http://localhost:8082/test-cloudinary

const verifyCloudinary = async () => {
  console.log('🔍 Verifying Cloudinary Configuration...');
  
  const cloudName = 'dv0heb3cz';
  const uploadPreset = 'alumni_uploads';
  
  console.log('📋 Configuration:');
  console.log('  Cloud Name:', cloudName);
  console.log('  Upload Preset:', uploadPreset);
  console.log('  Upload URL:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
  
  // Test with a simple text file to check if preset exists
  const formData = new FormData();
  formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'alumni-platform/test');
  
  try {
    console.log('🚀 Testing upload preset...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('📊 Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Upload preset exists and works.');
      console.log('📥 Response:', data);
      return true;
    } else {
      const error = await response.json();
      console.log('❌ ERROR:', error);
      
      if (error.error?.message?.includes('Upload preset')) {
        console.log('🔧 SOLUTION: Create upload preset named "alumni_uploads" in Cloudinary console');
        console.log('🔗 Go to: https://cloudinary.com/console');
      }
      
      return false;
    }
  } catch (error) {
    console.log('💥 NETWORK ERROR:', error.message);
    return false;
  }
};

// Auto-run verification
verifyCloudinary();
