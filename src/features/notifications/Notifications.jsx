import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { subscribeToIncomingRequests, acceptConnection, rejectConnection, subscribeToConnections, subscribeToActivities, subscribeToIncomingMessages } from "@/services/socialService";
import { Button, Avatar, AvatarImage, AvatarFallback, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { User, Check, X, Bell, Briefcase, CheckCircle, MessageCircle, Trash2, Users, Calendar, Star, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/services/firebase";
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, limit } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { connectionRequests, suggestions, activities: networkActivities } = useNotifications();
    const [events, setEvents] = useState([]);
    const [opportunities, setOpportunities] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Fetch recent events
        const eventsQ = query(collection(db, "events"), orderBy("startDate", "desc"), limit(5));
        const unsubEvents = onSnapshot(eventsQ, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch recent opportunities
        const oppsQ = query(collection(db, "opportunities"), orderBy("timestamp", "desc"), limit(5));
        const unsubOpps = onSnapshot(oppsQ, (snapshot) => {
            setOpportunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubEvents();
            unsubOpps();
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
                        {connectionRequests.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No pending requests</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {connectionRequests.map((request) => (
                                    <div key={request.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={request.fromPhoto} />
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
                                        <AvatarImage src={suggestion.photoURL} />
                                        <AvatarFallback>{suggestion.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{suggestion.name}</p>
                                        <p className="text-xs text-slate-500">{suggestion.role} • {suggestion.department}</p>
                                        <p className="text-xs text-blue-600 mt-1">{suggestion.company || 'Alumni'}</p>
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
                                        <p className="text-xs text-slate-500">
                                            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'} • {event.mode}
                                        </p>
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
                                        <Button size="sm" className="mt-2 h-8 px-3" onClick={() => navigate('/opportunities')}>
                                            <Briefcase className="h-3 w-3 mr-1" /> View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Updates */}
                {networkActivities.length > 0 && (
                    <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-slate-50 border-b py-4">
                            <CardTitle className="text-lg font-bold">Network Updates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {networkActivities.map((act) => (
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
