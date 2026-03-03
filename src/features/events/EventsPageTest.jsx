import React from 'react';

const EventsPageTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Events Test Page</h1>
      <p className="text-gray-600">This is a test to see if the events route works.</p>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Components</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">✅ Route Working</h3>
            <p className="text-blue-700">Events page route is accessible</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900">✅ Component Loading</h3>
            <p className="text-green-700">React component is rendering</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900">⚠️ Next Steps</h3>
            <p className="text-yellow-700">Replace with full EventsPage when ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPageTest;
