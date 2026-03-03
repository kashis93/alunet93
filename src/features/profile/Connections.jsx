import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { subscribeToConnections } from "@/services/socialService";
import { Avatar, AvatarImage, AvatarFallback, Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Users, MessageCircle, Calendar, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/services/firebase";
import { collection, onSnapshot, query, where, orderBy, getDoc, doc } from "firebase/firestore";

const Connections = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubConnections = subscribeToConnections(user.uid, async (cons) => {
            const connectionDetails = [];
            
            for (const conn of cons) {
                try {
                    const userDoc = await getDoc(doc(db, "users", conn.partnerId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        connectionDetails.push({
                            id: conn.partnerId,
                            name: userData.name || userData.displayName || "Unknown",
                            email: userData.email,
                            photoURL: userData.photoURL,
                            role: userData.role || "Alumni",
                            company: userData.company,
                            department: userData.department,
                            batch: userData.batch || userData.year,
                            location: userData.location,
                            connectedAt: conn.timestamp
                        });
                    }
                } catch (error) {
                    console.error("Error fetching connection details:", error);
                }
            }
            
            setConnections(connectionDetails);
            setLoading(false);
        });

        return () => unsubConnections();
    }, [user]);

    const handleMessage = (userId) => {
        // Navigate to chat with this user
        navigate(`/chat/${userId}`);
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto px-4 py-20 min-h-screen">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading connections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-20 min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">My Connections</h1>
                    <p className="text-muted-foreground">Alumni you're connected with</p>
                </div>
            </div>

            {connections.length === 0 ? (
                <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                    <CardContent className="p-12 text-center">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No connections yet</h3>
                        <p className="text-muted-foreground mb-4">Start connecting with fellow alumni to build your network</p>
                        <Button onClick={() => navigate('/directory')}>
                            Find Alumni
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {connections.map((connection) => (
                        <Card key={connection.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={connection.photoURL} alt={connection.name} />
                                        <AvatarFallback className="text-lg">
                                            {connection.name?.[0]?.toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold text-slate-900 truncate">
                                                    {connection.name}
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {connection.role} at {connection.company || connection.department || "L.D. College of Engineering"}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                                                    {connection.batch && (
                                                        <div className="flex items-center gap-1">
                                                            <GraduationCap className="h-3 w-3" />
                                                            <span>Batch {connection.batch}</span>
                                                        </div>
                                                    )}
                                                    {connection.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{connection.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            Connected {connection.connectedAt ? 
                                                                new Date(connection.connectedAt.toDate()).toLocaleDateString() : 
                                                                'Recently'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => navigate(`/profile/${connection.id}`)}
                                                >
                                                    View Profile
                                                </Button>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => handleMessage(connection.id)}
                                                >
                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                    Message
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Connections;
