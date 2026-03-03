import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Simple test app
const AppSimple = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Simple App Working</h1>
              <p className="text-gray-600">React Router is working.</p>
            </div>
          } />
          <Route path="*" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900">404 - Not Found</h1>
              <p className="text-gray-600">Page not found.</p>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default AppSimple;
