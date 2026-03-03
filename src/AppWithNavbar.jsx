import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sonner, Toaster } from "@/components/ui";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import Navbar from "@/components/Navbar.jsx";

// App with Navbar
const AppWithNavbar = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Sonner />
        <Toaster />
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16">
          <Routes>
            <Route path="/" element={
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">App with Navbar Working!</h1>
                <p className="text-gray-600">All components are loading properly.</p>
                <div className="mt-4 space-y-2">
                  <p>✅ React</p>
                  <p>✅ React Router</p>
                  <p>✅ UI Components</p>
                  <p>✅ AuthContext</p>
                  <p>✅ Navbar</p>
                </div>
              </div>
            } />
            <Route path="*" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900">404 - Not Found</h1>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppWithNavbar;
