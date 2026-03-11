import { lazy, Suspense } from "react";
import { Sonner, Toaster, TooltipProvider } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.jsx";
import { NotificationProvider } from "@/contexts/NotificationContext.jsx";
import { RealTimeProvider } from "@/contexts/RealTimeContext.jsx";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import LoginModal from "@/components/LoginModal.jsx";
import NotFound from "@/components/NotFound.jsx";
import { Navigate } from "react-router-dom";

// Lazy load all feature components to prevent resource exhaustion
const Home = lazy(() => import("@/features/home/Home.jsx"));
const Events = lazy(() => import("@/features/events/Events.jsx"));
const Directory = lazy(() => import("@/features/directory/Directory.jsx"));
const FeedPage = lazy(() => import("@/features/feed/FeedClean.jsx"));
const Challenges = lazy(() => import("@/features/challenges/ChallengesList.jsx"));
const ChallengeDetails = lazy(() => import("@/features/challenges/ChallengeDetails.jsx"));
const PostChallenge = lazy(() => import("@/features/challenges/PostChallenge.jsx"));
const Startup = lazy(() => import("@/features/startup/Startup.jsx"));
const Opportunities = lazy(() => import("@/features/opportunities/Opportunities.jsx"));
const ChatRoom = lazy(() => import("@/features/chat/ChatRoom.jsx"));
const Notifications = lazy(() => import("@/features/notifications/Notifications.jsx"));
const Leaderboard = lazy(() => import("@/features/directory/Leaderboard.jsx"));
const Profile = lazy(() => import("@/features/profile/ProfileModern.jsx"));
const AchievementsPage = lazy(() => import("@/features/achievements/AchievementsPage.jsx"));
const CompleteProfile = lazy(() => import("@/features/profile/CompleteProfile.jsx"));
const Connections = lazy(() => import("@/features/profile/Connections.jsx"));
const MyActivity = lazy(() => import("@/features/profile/MyActivity.jsx"));

const PrivateRoute = ({ children }) => {
  const { user, isProfileComplete } = useAuth();

  // If not logged in, they can see the page (explore)
  if (!user) return children;

  // If logged in but profile not complete, force completion
  if (!isProfileComplete) return <Navigate to="/complete-profile" />;

  return children;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <RealTimeProvider>
              <Navbar />
              <LoginModal />
              <main className="min-h-screen pt-0">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading...</p>
                    </div>
                  </div>
                }>
                  <Routes>
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
                    <Route path="/profile/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
                    <Route path="/directory" element={<PrivateRoute><Directory /></PrivateRoute>} />
                    <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
                    <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
                    <Route path="/chat/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
                    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                    <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
                    <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
                    <Route path="/challenges/:id" element={<PrivateRoute><ChallengeDetails /></PrivateRoute>} />
                    <Route path="/challenges/post" element={<PrivateRoute><PostChallenge /></PrivateRoute>} />
                    <Route path="/startup" element={<PrivateRoute><Startup /></PrivateRoute>} />
                    <Route path="/achievements" element={<PrivateRoute><AchievementsPage /></PrivateRoute>} />
                    <Route path="/my-activity" element={<PrivateRoute><MyActivity /></PrivateRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </RealTimeProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
