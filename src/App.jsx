
import { Sonner, Toaster, TooltipProvider } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.jsx";
import { NotificationProvider } from "@/contexts/NotificationContext.jsx";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import LoginModal from "@/components/LoginModal.jsx";
import Home from "@/features/home/Home.jsx";
import Events from "@/features/events/Events.jsx";
import Directory from "@/features/directory/Directory.jsx";
import Blogs from "@/features/blogs/Blogs.jsx";
import Challenges from "@/features/challenges/Challenges.jsx";
import ChallengeDetails from "@/features/challenges/ChallengeDetails.jsx";
import Startup from "@/features/startup/Startup.jsx";
import Opportunities from "@/features/opportunities/Opportunities.jsx";
import QnA from "@/features/qna/QnA.jsx";
import ChatRoom from "@/features/chat/ChatRoom.jsx";
import Notifications from "@/features/notifications/Notifications.jsx";
import Leaderboard from "@/features/directory/Leaderboard.jsx";
import NotFound from "@/components/NotFound.jsx";
import Profile from "@/features/profile/Profile.jsx";
import AchievementsPage from "@/features/achievements/AchievementsPage.jsx";
import CompleteProfile from "@/features/profile/CompleteProfile.jsx";
import { Navigate } from "react-router-dom";

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
            <Navbar />
            <LoginModal />
            <main className="min-h-screen pt-0">
<Routes>
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
              <Route path="/directory" element={<PrivateRoute><Directory /></PrivateRoute>} />
              <Route path="/blogs" element={<PrivateRoute><Blogs /></PrivateRoute>} />
              <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
              <Route path="/qna" element={<PrivateRoute><QnA /></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
              <Route path="/chat/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
              <Route path="/challenges/:id" element={<PrivateRoute><ChallengeDetails /></PrivateRoute>} />
              <Route path="/startup" element={<PrivateRoute><Startup /></PrivateRoute>} />
              <Route path="/achievements" element={<PrivateRoute><AchievementsPage /></PrivateRoute>} />
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

export default App;
