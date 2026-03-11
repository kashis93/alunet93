import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { subscribeToConnections, getOrCreateChat, sendConnectionRequest, subscribeToOutgoingRequests } from "@/services/socialService";
import { db, storage, auth } from "@/services/firebase";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, Badge, Separator } from "@/components/ui";
import { User, MessageCircle, Mail, MapPin, Briefcase, GraduationCap, Award, Users, Edit, Upload, Link as LinkIcon, PenTool, Calendar, Plus, Activity, ImageIcon, ExternalLink, MoreHorizontal, Bookmark, Grid, Video, FileText, Star, TrendingUp, Clock, Map, Camera, Check, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/utils";
import EditProfileModal from "./EditProfileModal";
import ExperienceModal from "./ExperienceModal";
import EducationModal from "./EducationModal";
import ChallengeDetailsModal from "./ChallengeDetailsModal";
import PostSimpleFixed from "@/features/feed/components/PostSimpleFixed";
import PhotoUploadFixed from './components/PhotoUploadFixed';
import ProfileBackground from './components/ProfileBackground';
import { getSingleStatus } from "@/services/postsAPI";
import { alumni as dummyAlumni } from "@/data/dummyData.js";
import noteworthyAlumniRaw from "@/data/noteworthyAlumni.json";

const ProfileModern = () => {
    const { user, refreshUser } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const profileUserId = id || user?.uid;
    const isOwnProfile = !id || id === user?.uid;

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);
    const [connectionDetails, setConnectionDetails] = useState([]);
    const [currentUserConnections, setCurrentUserConnections] = useState(new Set());
    const [pendingOutgoingRequests, setPendingOutgoingRequests] = useState(new Set());
    const [activeTab, setActiveTab] = useState('about');
    const [editOpen, setEditOpen] = useState(false);
    const [experienceOpen, setExperienceOpen] = useState(false);
    const [educationOpen, setEducationOpen] = useState(false);
    const [challengeDetailsOpen, setChallengeDetailsOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [connectionsOpen, setConnectionsOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [displayUser, setDisplayUser] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        bio: "",
        company: "",
        achievement: "",
        portfolioUrl: "",
        linkedinUrl: "",
        twitterUrl: ""
    });

    const [myPosts, setMyPosts] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [myChallenges, setMyChallenges] = useState([]);
    const [myCode, setMyCode] = useState([]);
    const [myOpportunities, setMyOpportunities] = useState([]);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [counts, setCounts] = useState({ posts: 0 });
    const [unsubscribeChallenges, setUnsubscribeChallenges] = useState(null);

    // Fetch user data function
    const fetchUserData = useCallback(async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setMyEvents(userData.events || []);
                setMyOpportunities(userData.opportunities || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setMyEvents([]);
            setMyChallenges([]);
            setMyOpportunities([]);
        }
    }, []);

    useEffect(() => {
        if (isOwnProfile && user) {
            setPhotoPreview(user.photoURL);
            setBackgroundImage(user.backgroundImage || null);
            setEditData({
                name: user.name || user.displayName || "",
                bio: user.bio || "",
                company: user.company || "",
                achievement: user.achievement || "",
                backgroundImage: user.backgroundImage || null,
                portfolioUrl: user.portfolioUrl || "",
                linkedinUrl: user.linkedinUrl || "",
                twitterUrl: user.twitterUrl || ""
            });
        }
    }, [isOwnProfile, user]);

    useEffect(() => {
        if (!profileUserId) return;
        setLoading(true);

        // Get profile user data
        const userDocRef = doc(db, "users", profileUserId);
        const unsubscribeProfileUser = onSnapshot(userDocRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                setDisplayUser(userData);
                if (!isOwnProfile) setPhotoPreview(userData.photoURL);
            } else {
                // Check static data
                const staticUser = dummyAlumni.find(alum => alum.id === profileUserId);
                if (staticUser) {
                    setDisplayUser({
                        uid: profileUserId,
                        name: staticUser.name,
                        graduationYear: parseInt(staticUser.batch) || 0,
                        department: staticUser.department || "General",
                        company: staticUser.position.includes(" at ") ? staticUser.position.split(" at ")[1] : staticUser.position,
                        role: staticUser.position.includes(" at ") ? staticUser.position.split(" at ")[0] : "Alumni",
                        location: "Ahmedabad",
                        photoURL: staticUser.image,
                        skills: ["Distinguished", "Leader"],
                        isMentor: false,
                        membershipType: "LAA Member",
                        achievement: staticUser.achievement,
                        bio: staticUser.achievement
                    });
                } else {
                    toast.error("User not found");
                }
            }
            setLoading(false);
        });

        // Load posts for this user
        const postsQuery = query(
            collection(db, "posts"),
            where("authorId", "==", profileUserId)
        );

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const seen = new Set();
            const postsData = snapshot.docs.map(d => {
                const postData = d.data();
                return {
                    id: d.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate?.() || new Date(postData.createdAt) || new Date()
                };
            }).filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            }).sort((a, b) => b.createdAt - a.createdAt);
            setMyPosts(postsData);
            setCounts(prev => ({ ...prev, posts: postsData.length }));
        }, (error) => {
            console.error("Error loading posts:", error);
        });

        // Fetch user data
        fetchUserData(profileUserId);

        return () => {
            unsubscribeProfileUser();
            unsubscribePosts();
            unsubscribeChallenges && unsubscribeChallenges();
        };
    }, [profileUserId, isOwnProfile, fetchUserData]);

    useEffect(() => {
        if (!profileUserId || !user?.uid) return;

        const unsubscribeConnections = subscribeToConnections(user.uid, (cons) => {
            setCurrentUserConnections(new Set(cons.map(c => c.partnerId)));
        });

        const unsubscribeOutgoing = subscribeToOutgoingRequests(user.uid, (reqs) => {
            const pending = new Set(
                reqs.filter(r => r.status === 'pending').map(r => r.toId)
            );
            setPendingOutgoingRequests(pending);
        });

        const unsubscribeProfileConnections = subscribeToConnections(profileUserId, async (cons) => {
            setConnections(cons);
            const details = await Promise.all(cons.map(async (con) => {
                const partnerDoc = await getDoc(doc(db, "users", con.partnerId));
                return { id: con.partnerId, ...partnerDoc.data() };
            }));
            setConnectionDetails(details);
        });

        return () => {
            unsubscribeConnections();
            unsubscribeOutgoing();
            unsubscribeProfileConnections();
        };
    }, [profileUserId, user?.uid]);

    const handleMessage = async (partnerId) => {
        try {
            const chatId = await getOrCreateChat(user.uid, partnerId);
            navigate(`/chat/${chatId}`);
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to start chat.");
        }
    };

    const handleChallengeClick = (challenge) => {
        setSelectedChallenge(challenge);
        setChallengeDetailsOpen(true);
    };

    const handleConnect = async () => {
        if (!user || (!displayUser && !profileUserId)) {
            toast.error("Please log in or wait for profile to load.");
            return;
        }
        try {
            await sendConnectionRequest(user, profileUserId);
            toast.success("Connection request sent!");
        } catch (error) {
            console.error("Connection error:", error);
            toast.error("Failed to send connection request.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* LinkedIn-style Profile Header */}
            <div className="bg-white shadow-sm border-b">
                {/* Cover Photo with overlay and compact height */}
                <div className="relative h-44 md:h-56 bg-gradient-to-r from-blue-500 to-purple-600">
                    {backgroundImage ? (
                        <img
                            src={backgroundImage}
                            alt="Cover"
                            className="w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Inline header content (avatar + text + actions) */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-4 flex items-end justify-between">
                        <div className="flex items-end gap-4">
                            <div className="relative">
                                <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-white rounded-full shadow-xl">
                                    <AvatarImage src={photoPreview} alt={displayUser?.name} />
                                    <AvatarFallback className="text-xl md:text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                        {displayUser?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {isOwnProfile && (
                                    <Button
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="pb-2">
                                <h1 className="text-white drop-shadow-sm text-2xl md:text-3xl font-bold leading-tight">
                                    {displayUser?.name || "User"}
                                </h1>
                                <p className="text-white/90 text-sm md:text-base">
                                    {displayUser?.role || "Digital Architect"} <span className="text-white/60 mx-1">•</span> {displayUser?.company || "Tech Innovators"}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs md:text-sm text-white/80">
                                    <span className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {displayUser?.location || "Ahmedabad, India"}
                                    </span>
                                    <span>•</span>
                                    <button
                                        onClick={() => navigate('/connections')}
                                        className="underline-offset-2 hover:underline font-medium"
                                    >
                                        {connectionDetails.length}+ connections
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="hidden sm:flex items-center gap-2">
                            {isOwnProfile ? (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-full font-bold bg-white/20 text-white border-none hover:bg-white/30"
                                    onClick={() => setEditOpen(true)}
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => handleMessage(displayUser?.uid)}
                                        className="bg-white text-slate-900 hover:bg-white/90 rounded-full font-bold shadow-sm"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Message
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleConnect}
                                        disabled={pendingOutgoingRequests.has(profileUserId) || currentUserConnections.has(profileUserId)}
                                        className={cn(
                                            "rounded-full font-black text-xs uppercase tracking-widest px-8 h-10 transition-all shadow-md group",
                                            currentUserConnections.has(profileUserId)
                                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none"
                                                : pendingOutgoingRequests.has(profileUserId)
                                                    ? "bg-amber-50 text-amber-600 border border-amber-100 cursor-default"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        {currentUserConnections.has(profileUserId) ? (
                                            <><Check className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform" /> Connected</>
                                        ) : pendingOutgoingRequests.has(profileUserId) ? (
                                            <><Clock className="h-3.5 w-3.5 mr-2" /> Requested</>
                                        ) : (
                                            <><Users className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform" /> Connect</>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>

                    </div>

                    {/* Edit cover button */}
                    {isOwnProfile && (
                        <Button
                            size="sm"
                            onClick={() => coverInputRef.current?.click()}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-800 font-medium rounded-full shadow-lg"
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Edit Cover
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-700 leading-relaxed">{displayUser?.bio || "No bio available"}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600">{user?.email || "Email not available"}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600">{displayUser?.location || "Ahmedabad, India"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Experience</CardTitle>
                                {isOwnProfile && (
                                    <Button size="sm" onClick={() => setExperienceOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Experience
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="border-l-2 border-blue-200 pl-6 relative">
                                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{displayUser?.role || "Senior Position"}</h3>
                                            <p className="text-gray-600">{displayUser?.company || "Company Name"}</p>
                                            <p className="text-sm text-gray-500 mt-1">Present • {displayUser?.location || "Ahmedabad, India"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Education</CardTitle>
                                {isOwnProfile && (
                                    <Button size="sm" onClick={() => setEducationOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Education
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="border-l-2 border-blue-200 pl-6 relative">
                                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">L.D. College of Engineering</h3>
                                            <p className="text-gray-600">Bachelor of Engineering, Computer Engineering</p>
                                            <p className="text-sm text-gray-500 mt-1">2018 • 2022</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Activity</CardTitle>
                                {isOwnProfile && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => navigate('/my-activity')}
                                        className="text-blue-600 hover:text-blue-800 font-black text-xs uppercase tracking-widest p-0 flex items-center gap-1"
                                    >
                                        View all activity
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {myPosts.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {myPosts.map((post) => (
                                            <PostSimpleFixed key={post.id} post={post} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No recent posts</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Profile Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Current</h4>
                                    <p className="text-sm text-gray-600">{displayUser?.role || "Alumni"}</p>
                                    <p className="text-sm text-gray-500">{displayUser?.company || "Company"}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                                    <p className="text-sm text-gray-600">{displayUser?.location || "Ahmedabad, India"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {displayUser?.skills?.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    )) || (
                                            <Badge variant="secondary" className="text-xs">Leadership</Badge>
                                        )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Contact Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {user?.email && (
                                    <div className="text-sm">
                                        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                                            {user.email}
                                        </a>
                                    </div>
                                )}
                                {displayUser?.portfolioUrl && (
                                    <div className="text-sm">
                                        <a href={displayUser.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            Portfolio
                                        </a>
                                    </div>
                                )}
                                {displayUser?.linkedinUrl && (
                                    <div className="text-sm">
                                        <a href={displayUser.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            LinkedIn
                                        </a>
                                    </div>
                                )}
                                {displayUser?.twitterUrl && (
                                    <div className="text-sm">
                                        <a href={displayUser.twitterUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            Twitter
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                    }
                }}
            />
            <input
                type="file"
                ref={coverInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        setBackgroundImage(URL.createObjectURL(file));
                    }
                }}
            />

            {/* Modals */}
            <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />

            <ExperienceModal open={experienceOpen} onOpenChange={setExperienceOpen} />

            <EducationModal open={educationOpen} onOpenChange={setEducationOpen} />
        </div >
    );
};

export default ProfileModern;
