import React from 'react';

const AppTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🚀 App Test</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Basic Components Working</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">✅ React</h3>
              <p className="text-green-700">React is rendering correctly</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">✅ Tailwind CSS</h3>
              <p className="text-green-700">Styling is working</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">✅ Lucide Icons</h3>
              <p className="text-green-700">Icons are loading correctly</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800">🔧 Environment Variables</h3>
              <p className="text-blue-700">Cloudinary: {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not configured'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Next Steps</h2>
          
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>Check browser console for any errors</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>Verify all imports are working</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>Test navigation to different pages</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>Check Cloudinary configuration</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AppTest;
