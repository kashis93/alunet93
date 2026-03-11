import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  AvatarFallback,
  Badge
} from "@/components/ui";

const featureLinks = [
  { path: "/", label: "Home", icon: Users },
  { path: "/opportunities", label: "Opportunities", icon: Briefcase },
  { path: "/challenges", label: "Challenges", icon: Zap },
  { path: "/startup", label: "Startup Hub", icon: Rocket },
  { path: "/events", label: "Events", icon: Calendar },
  { path: "/directory", label: "Directory", icon: Users },
  { path: "/feed", label: "Feed", icon: MessageCircle },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { user, logout, setShowLoginModal } = useAuth();
  const { totalNotifications, connectionRequests, messages, activities, suggestions } = useNotifications();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchQuery)}`);
    }
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
                  {/* REAL NOTIFICATIONS DROPDOWN */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative group outline-none" title="Notifications">
                        <Bell className="text-white w-5 h-5 group-hover:text-cyan-400 transition" />
                        {totalNotifications > 0 && (
                          <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900 leading-none">
                            {totalNotifications}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-2xl overflow-hidden border-slate-200">
                      <div className="bg-slate-900 p-4 flex items-center justify-between">
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Updates</h3>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 text-[10px]">
                          {totalNotifications} New
                        </Badge>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {/* Connection Requests */}
                        {connectionRequests.length > 0 && (
                          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Requests</p>
                            {connectionRequests.map(req => (
                              <div key={req.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition">
                                <Avatar className="h-10 w-10 border border-slate-100">
                                  <AvatarImage src={req.fromPhoto} />
                                  <AvatarFallback>{req.fromName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{req.fromName}</p>
                                  <p className="text-[10px] text-slate-500">wants to connect</p>
                                </div>
                                <Button size="sm" className="h-7 bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-bold rounded-lg px-3">
                                  Accept
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recent Activities */}
                        <div className="p-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Recent suggestions</p>
                          <div className="space-y-3">
                            {suggestions.length > 0 ? suggestions.slice(0, 4).map(sug => (
                              <Link to={`/profile/${sug.id}`} key={sug.id} className="flex items-center gap-3 group">
                                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-cyan-500 transition-all">
                                  <AvatarImage src={sug.photoURL} />
                                  <AvatarFallback>{sug.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-cyan-600 transition">{sug.name}</p>
                                  <p className="text-[9px] text-slate-500 uppercase tracking-tighter">{sug.role || 'Alumni'} • {sug.department || 'CSE'}</p>
                                </div>
                              </Link>
                            )) : (
                              <p className="text-[10px] text-slate-400 text-center py-2 italic font-medium">No new suggestions yet</p>
                            )}
                          </div>
                        </div>

                        {activities.length > 0 && (
                          <div className="p-3 bg-slate-50/30 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">From Network</p>
                            <div className="space-y-3">
                              {activities.slice(0, 3).map(act => (
                                <div key={act.id} className="flex gap-3">
                                  <div className="mt-1 w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-800 leading-snug">
                                      <span className="font-black text-slate-900">{act.authorName}</span> {act.title}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Link
                        to="/notifications"
                        className="block w-full text-center py-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-600 transition hover:bg-slate-100"
                      >
                        View all activity
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition ${isActive
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {featureLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-cyan-500 text-white" : "text-gray-700 bg-gray-50"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-gray-700">
                    <Bell className="inline-block mr-1 h-5 w-5" />
                  </Link>
                  <Link to="/chat" onClick={() => setIsOpen(false)} className="text-gray-700">
                    <MessageCircle className="inline-block mr-1 h-5 w-5" />
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-700">
                    <User className="inline-block mr-1 h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="flex-1 bg-cyan-500 text-white"
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
