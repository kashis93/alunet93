import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { subscribeToIncomingRequests, acceptConnection, rejectConnection, subscribeToConnections, subscribeToActivities, subscribeToIncomingMessages } from "@/services/socialService";
import { Button, Avatar, AvatarImage, AvatarFallback, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { User, Check, X, Bell, Briefcase, CheckCircle, MessageCircle, Trash2, Users, Calendar, Star, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/services/firebase";
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [acceptedConnections, setAcceptedConnections] = useState([]);
    const [activities, setActivities] = useState([]);
    const [incomingMessages, setIncomingMessages] = useState([]);
    const [senderData, setSenderData] = useState({});
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [events, setEvents] = useState([]);
    const [opportunities, setOpportunities] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Generate mock suggestions based on user profile
        const generateSuggestions = () => {
            const mockSuggestions = [
                { id: 1, name: "Rahul Sharma", branch: "Computer Engineering", year: "2019", reason: "Same branch", avatar: "RS" },
                { id: 2, name: "Priya Patel", branch: "Computer Engineering", year: "2020", reason: "Same batch", avatar: "PP" },
                { id: 3, name: "Amit Kumar", branch: "Information Technology", year: "2018", reason: "Works at Google", avatar: "AK" },
                { id: 4, name: "Neha Gupta", branch: "Computer Engineering", year: "2019", reason: "Same year", avatar: "NG" },
                { id: 5, name: "Vikram Singh", branch: "Computer Engineering", year: "2017", reason: "Alumni mentor", avatar: "VS" }
            ];
            setSuggestions(mockSuggestions);
        };

        // Generate mock events
        const generateEvents = () => {
            const mockEvents = [
                { id: 1, title: "Alumni Meet 2024", date: "2024-03-15", type: "Networking" },
                { id: 2, title: "Tech Talk: AI in Industry", date: "2024-03-20", type: "Workshop" },
                { id: 3, title: "Career Guidance Session", date: "2024-03-25", type: "Seminar" }
            ];
            setEvents(mockEvents);
        };

        // Generate mock opportunities
        const generateOpportunities = () => {
            const mockOpportunities = [
                { id: 1, title: "Senior Software Engineer", company: "Microsoft", skills: "React, Node.js" },
                { id: 2, title: "Product Manager", company: "Google", skills: "Product Strategy" },
                { id: 3, title: "Data Scientist", company: "Amazon", skills: "Python, ML" }
            ];
            setOpportunities(mockOpportunities);
        };

        generateSuggestions();
        generateEvents();
        generateOpportunities();

        const pendingQ = query(
            collection(db, "connections"),
            where("toId", "==", user.uid),
            where("status", "==", "pending"),
            orderBy("timestamp", "desc")
        );
        const unsubPending = onSnapshot(pendingQ, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingRequests(requests);
        });

        const unsubConnections = subscribeToConnections(user.uid, (cons) => {
            const partnerIds = cons.map(c => c.partnerId);
            if (partnerIds.length > 0) {
                const unsubActivities = subscribeToActivities(partnerIds, (newActs) => {
                    setActivities(newActs);
                });
                return () => unsubActivities();
            }
            setLoading(false);
        });

        return () => {
            unsubPending();
            unsubConnections();
        };
    }, [user]);

    const handleAccept = async (requestId, name) => {
        try {
            await acceptConnection(requestId);
            toast.success(`Connected with ${name}!`);
        } catch (error) {
            console.error("Failed to accept connection:", error);
            toast.error("Failed to accept request.");
        }
    };

    const handleReject = async (requestId, name) => {
        try {
            await rejectConnection(requestId);
            toast.success(`Rejected connection request from ${name}`);
        } catch (error) {
            console.error("Failed to reject connection:", error);
            toast.error("Failed to reject request.");
        }
    };

    return (
        <div className="container max-w-2xl mx-auto px-4 py-20 min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bell className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">Manage connections and view network updates</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Connection Requests */}
                <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                    <CardHeader className="bg-slate-50 border-b py-4">
                        <CardTitle className="text-lg font-bold">Connection Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-muted-foreground">Loading requests...</div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No pending requests</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={request.fromPhotoURL} />
                                            <AvatarFallback>{request.fromName?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">{request.fromName}</p>
                                            <p className="text-xs text-slate-500 mt-1">wants to connect with you</p>
                                            <div className="flex gap-2 mt-3">
                                                <Button size="sm" className="h-8 px-3" onClick={() => handleAccept(request.id, request.fromName)}>
                                                    <Check className="h-3 w-3 mr-1" /> Accept
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => handleReject(request.id, request.fromName)}>
                                                    <X className="h-3 w-3 mr-1" /> Ignore
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Suggestions */}
                <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                    <CardHeader className="bg-slate-50 border-b py-4">
                        <CardTitle className="text-lg font-bold">People You May Know</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {suggestions.map((suggestion) => (
                                <div key={suggestion.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>{suggestion.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{suggestion.name}</p>
                                        <p className="text-xs text-slate-500">{suggestion.branch} • {suggestion.year}</p>
                                        <p className="text-xs text-blue-600 mt-1">{suggestion.reason}</p>
                                        <Button size="sm" className="mt-2 h-8 px-3">
                                            <Users className="h-3 w-3 mr-1" /> Connect
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Events */}
                <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                    <CardHeader className="bg-slate-50 border-b py-4">
                        <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                        <p className="text-xs text-slate-500">{event.date} • {event.type}</p>
                                        <Button size="sm" variant="outline" className="mt-2 h-8 px-3">
                                            <Calendar className="h-3 w-3 mr-1" /> Register
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Job Opportunities */}
                <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                    <CardHeader className="bg-slate-50 border-b py-4">
                        <CardTitle className="text-lg font-bold">Job Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {opportunities.map((opp) => (
                                <div key={opp.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{opp.title}</p>
                                        <p className="text-xs text-slate-500">{opp.company}</p>
                                        <p className="text-xs text-blue-600 mt-1">{opp.skills}</p>
                                        <Button size="sm" className="mt-2 h-8 px-3">
                                            <Briefcase className="h-3 w-3 mr-1" /> Apply
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Updates */}
                {activities.length > 0 && (
                    <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-slate-50 border-b py-4">
                            <CardTitle className="text-lg font-bold">Network Updates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {activities.map((act) => (
                                    <div key={act.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-800">
                                                <span className="font-bold">{act.authorName}</span> posted a new {act.type}: 
                                                <span className="font-semibold text-primary ml-1">{act.title}</span> at {act.company}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {act.timestamp?.toDate().toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Notifications;
