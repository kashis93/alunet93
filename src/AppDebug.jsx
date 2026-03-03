import React from 'react';

const AppDebug = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Debug App</h1>
      <p className="text-gray-600">If you can see this, React is working.</p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Testing Components:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>✅ React loaded</li>
          <li>✅ Basic rendering working</li>
          <li>✅ CSS classes applied</li>
        </ul>
      </div>
    </div>
  );
};

export default AppDebug;
