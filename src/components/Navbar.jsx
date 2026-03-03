import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Zap,
  Rocket,
  MessageCircle,
  BarChart3,
  Users
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotifications } from "@/contexts/NotificationContext.jsx";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui";

const featureLinks = [
  { path: "/", label: "Home", icon: Users },
  { path: "/opportunities", label: "Opportunities", icon: Briefcase },
  { path: "/challenges", label: "Challenges", icon: Zap },
  { path: "/startup", label: "Startup", icon: Rocket },
  { path: "/events", label: "Events", icon: Calendar },
  { path: "/directory", label: "Directory", icon: Users },
  { path: "/feed", label: "Feed", icon: MessageCircle },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { user, logout, setShowLoginModal } = useAuth();
  const { totalNotifications } = useNotifications();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Top Navbar */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">

            {/* Logo + Right Section */}
            <div className="flex justify-between items-center w-full lg:w-auto">

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <GraduationCap className="text-cyan-400 w-6 h-6" />
                <span className="text-white font-bold text-lg">
                  Aluverse
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>

            {/* Search Bar (Visible on All Screens) */}
            <form onSubmit={handleSearch} className="w-full lg:w-1/3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search alumni, opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-white text-gray-700 border border-cyan-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-cyan-400" />
              </div>
            </form>

            {/* Right Section */}
            <div className="hidden lg:flex items-center space-x-3">

              {user ? (
                <>
                    <Link to="/notifications" className="relative" title="Notifications">
                      <Bell className="text-white w-5 h-5 hover:text-cyan-400 transition" />
                      {totalNotifications > 0 && (
                        <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs px-1 rounded-full">
                          {totalNotifications}
                        </span>
                      )}
                    </Link>

                    <Link to="/chat" className="relative" title="Messages">
                      <MessageCircle className="text-white w-5 h-5 hover:text-cyan-400 transition" />
                    </Link>

                    <Link to="/connections" className="relative" title="My Network">
                      <Users className="text-white w-5 h-5 hover:text-cyan-400 transition" />
                    </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-0">
                        <Avatar className="h-8 w-8 border-2 border-white/20">
                          <AvatarImage src={user?.photoURL} />
                          <AvatarFallback className="bg-cyan-600 text-white">
                            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowLoginModal(true)}
                    className="text-white"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-cyan-500 text-white"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex space-x-2 h-10 items-center">
            {featureLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-cyan-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;