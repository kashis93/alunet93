import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sonner, Toaster } from "@/components/ui";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.jsx";
import Navbar from "@/components/Navbar.jsx";
import FeedPageSafeFixed from "@/features/feed/FeedPageSafeFixed";
import EventsPageSafeFixed from "@/features/events/EventsPageSafeFixed";
import ChallengesFixed from "@/features/challenges/ChallengesFixed";

// Private Route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
        <p className="text-gray-600">Please login to access this page.</p>
      </div>
    </div>
  );
};

// App with main routes
const AppWithRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Sonner />
        <Toaster />
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16">
          <Routes>
            <Route path="/" element={
              <PrivateRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Alumni Platform!</h1>
                  <p className="text-gray-600">All systems are working.</p>
                  <div className="mt-4 space-y-2">
                    <p>✅ React</p>
                    <p>✅ React Router</p>
                    <p>✅ AuthContext</p>
                    <p>✅ Navbar</p>
                    <p>✅ Private Routes</p>
                  </div>
                  <div className="mt-6 space-x-4">
                    <a href="/feed" className="text-blue-600 hover:text-blue-700">Feed</a>
                    <a href="/events" className="text-blue-600 hover:text-blue-700">Events</a>
                    <a href="/challenges" className="text-blue-600 hover:text-blue-700">Challenges</a>
                  </div>
                </div>
              </PrivateRoute>
            } />
            <Route path="/feed" element={
              <PrivateRoute>
                <FeedPageSafeFixed />
              </PrivateRoute>
            } />
            <Route path="/events" element={
              <PrivateRoute>
                <EventsPageSafeFixed />
              </PrivateRoute>
            } />
            <Route path="/challenges" element={
              <PrivateRoute>
                <ChallengesFixed />
              </PrivateRoute>
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

export default AppWithRoutes;
