import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sonner, Toaster, TooltipProvider } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.jsx";
import { NotificationProvider } from "@/contexts/NotificationContext.jsx";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import LoginModal from "@/components/LoginModal.jsx";
import Home from "@/features/home/Home.jsx";
import Directory from "@/features/directory/Directory.jsx";
import FeedPageSafeFixed from "@/features/feed/FeedPageSafeFixed";
import EventsPageSafeFixed from "@/features/events/EventsPageSafeFixed";
import ChallengesFixed from "@/features/challenges/ChallengesFixed";
import ChallengeDetails from "@/features/challenges/ChallengeDetails.jsx";
import Startup from "@/features/startup/Startup.jsx";
import Opportunities from "@/features/opportunities/Opportunities.jsx";
import ChatRoom from "@/features/chat/ChatRoom.jsx";
import Notifications from "@/features/notifications/Notifications.jsx";
import Leaderboard from "@/features/directory/Leaderboard.jsx";
import NotFound from "@/components/NotFound.jsx";
import Profile from "@/features/profile/Profile.jsx";
import SignUp from "@/features/auth/SignUp";
import CompleteProfileFixed from "@/features/profile/CompleteProfileFixed.jsx";
import Connections from "@/features/profile/Connections.jsx";
import CloudinaryTest from "@/test/CloudinaryTest.jsx";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

const AppFinal = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <Sonner />
              <Toaster />
              <Navbar />
              <LoginModal />
              <main className="min-h-screen pt-0">
                <Routes>
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/complete-profile" element={<CompleteProfileFixed />} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
                  <Route path="/feed" element={<PrivateRoute><FeedPageSafeFixed /></PrivateRoute>} />
                  <Route path="/events" element={<PrivateRoute><EventsPageSafeFixed /></PrivateRoute>} />
                  <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                  <Route path="/directory" element={<PrivateRoute><Directory /></PrivateRoute>} />
                  <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
                  <Route path="/chat" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
                  <Route path="/chat/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
                  <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                  <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
                  <Route path="/challenges" element={<PrivateRoute><ChallengesFixed /></PrivateRoute>} />
                  <Route path="/challenges/:id" element={<PrivateRoute><ChallengeDetails /></PrivateRoute>} />
                  <Route path="/startup" element={<PrivateRoute><Startup /></PrivateRoute>} />
                  <Route path="/achievements" element={<PrivateRoute><FeedPageSafeFixed /></PrivateRoute>} />
                  <Route path="/test-cloudinary" element={<CloudinaryTest />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppFinal;
