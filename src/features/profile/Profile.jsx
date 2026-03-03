import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { subscribeToConnections, getOrCreateChat, sendConnectionRequest } from "@/services/socialService";
import { db, storage, auth } from "@/services/firebase";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, Badge, Separator } from "@/components/ui";
import { User, MessageCircle, Mail, MapPin, Briefcase, GraduationCap, Award, Users, Edit, Upload, Link as LinkIcon, PenTool, Calendar, Plus, Activity, ImageIcon, ExternalLink, MoreHorizontal } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const profileUserId = id || user?.uid;
    const isOwnProfile = !id || id === user?.uid;

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectionDetails, setConnectionDetails] = useState([]);
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
    const [myOpportunities, setMyOpportunities] = useState([]);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [counts, setCounts] = useState({ posts: 0 });
    const [unsubscribeChallenges, setUnsubscribeChallenges] = useState(null);

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
    }, [user, isOwnProfile]);

    useEffect(() => {
        if (!profileUserId) return;

        setLoading(true);
        const userDocRef = doc(db, "users", profileUserId);

        const unsubscribeProfileUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setDisplayUser({
                    uid: doc.id,
                    ...userData
                });
                // Update photo preview for all users (including own profile)
                console.log('Profile photoURL from Firestore:', userData.photoURL);
                setPhotoPreview(userData.photoURL);
            } else {
                let staticUser = dummyAlumni.find(a => a.id === profileUserId);

                if (!staticUser && profileUserId.startsWith("nw-")) {
                    const nwId = profileUserId.replace("nw-", "");
                    const raw = noteworthyAlumniRaw.find(a => a.id == nwId);
                    if (raw) {
                        staticUser = {
                            uid: profileUserId,
                            name: raw.name,
                            graduationYear: parseInt(raw.batch) || 0,
                            department: raw.department || "General",
                            company: raw.position.includes(" at ") ? raw.position.split(" at ")[1] : raw.position,
                            role: raw.position.includes(" at ") ? raw.position.split(" at ")[0] : "Alumni",
                            location: "Ahmedabad",
                            photoURL: raw.image,
                            skills: ["Distinguished", "Leader"],
                            isMentor: false,
                            membershipType: "LAA Member",
                            achievement: raw.achievement,
                            bio: raw.achievement
                        };
                    }
                }

                if (staticUser && !staticUser.uid) {
                    staticUser = {
                        uid: profileUserId,
                        name: staticUser.name,
                        graduationYear: staticUser.graduationYear,
                        department: staticUser.department,
                        company: staticUser.company,
                        role: staticUser.role,
                        location: staticUser.location,
                        photoURL: staticUser.avatar,
                        skills: staticUser.skills,
                        isMentor: staticUser.isMentor,
                        membershipType: staticUser.membershipType,
                        achievement: staticUser.achievement,
                        bio: `${staticUser.role} at ${staticUser.company}`
                    };
                }

                if (staticUser) {
                    setDisplayUser(staticUser);
                    if (!isOwnProfile) setPhotoPreview(staticUser.photoURL);
                } else {
                    toast.error("User not found");
                }
            }
            setLoading(false);
        });


        // Load posts for this user using Firebase (simplified query to avoid index errors)
        const postsQuery = query(
            collection(db, "posts"),
            where("authorId", "==", profileUserId)
        );

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const postsData = [];
            snapshot.forEach((doc) => {
                const postData = doc.data();
                postsData.push({
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate?.() || new Date(postData.createdAt) || new Date()
                });
            });
            setMyPosts(postsData);
            setCounts(prev => ({ ...prev, posts: postsData.length }));
        }, (error) => {
            console.error("Error loading posts:", error);
        });

        // Fetch real data for events, challenges, opportunities
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", profileUserId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setMyEvents(userData.events || []);
                    // Load challenges from main challenges collection (simplified to avoid index errors)
                    const challengesQuery = query(
                        collection(db, "challenges"),
                        where("alumniId", "==", profileUserId)
                    );
                    
                    const unsubscribeChallengesHandler = onSnapshot(challengesQuery, (snapshot) => {
                        const challengesData = [];
                        snapshot.forEach((doc) => {
                            const challengeData = doc.data();
                            challengesData.push({
                                id: doc.id,
                                ...challengeData,
                                createdAt: challengeData.createdAt?.toDate?.() || new Date(challengeData.createdAt) || new Date()
                            });
                        });
                        setMyChallenges(challengesData);
                        setUnsubscribeChallenges(() => unsubscribeChallengesHandler);
                    }, (error) => {
                        console.error("Error loading challenges:", error);
                    });
                    
                    setMyOpportunities(userData.opportunities || []);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                // Set empty arrays as fallback
                setMyEvents([]);
                setMyChallenges([]);
                setMyOpportunities([]);
            }
        };

        fetchUserData();

        return () => {
            unsubscribeProfileUser();
            unsubscribePosts();
            unsubscribeChallenges && unsubscribeChallenges();
        };
    }, [profileUserId, isOwnProfile]);

    useEffect(() => {
        if (!profileUserId) return;

        const unsubscribe = subscribeToConnections(profileUserId, async (cons) => {
            setConnections(cons);
            const details = await Promise.all(cons.map(async (con) => {
                const partnerDoc = await getDoc(doc(db, "users", con.partnerId));
                return { id: con.id, partnerId: con.partnerId, ...(partnerDoc.exists() ? partnerDoc.data() : {}) };
            }));
            setConnectionDetails(details);
        });

        return () => {
            unsubscribe();
        };
    }, [profileUserId]);

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
            const targetId = displayUser?.uid || profileUserId;
            await sendConnectionRequest(user, targetId);
            toast.success("Connection request sent!");
        } catch (error) {
            toast.error(error.message || "Failed to send request.");
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
            toast.success("Photo preview updated. Save to apply changes.");
        };
        reader.readAsDataURL(file);
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("Image must be less than 5MB");

        toast.info("Uploading cover photo...");
        try {
            const storageRef = ref(storage, `cover-photos/${user.uid}/${Date.now()}`);
            await uploadBytes(storageRef, file);
            const coverURL = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", user.uid), { coverPhotoURL: coverURL });
            toast.success("Cover photo updated!");
        } catch (error) {
            toast.error("Failed to upload cover photo.");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editData.name.trim()) return toast.error("Please enter your name");

        setEditLoading(true);
        const timeoutId = setTimeout(() => {
            setEditLoading(false);
            toast.error("Request timed out. Please check your connection.");
        }, 60000);

        try {
            const updateObj = {
                name: editData.name,
                bio: editData.bio,
                company: editData.company,
                achievement: editData.achievement,
                portfolioUrl: editData.portfolioUrl,
                linkedinUrl: editData.linkedinUrl,
                twitterUrl: editData.twitterUrl
            };

            if (photoFile) {
                try {
                    const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}`);
                    await uploadBytes(storageRef, photoFile);
                    const photoURL = await getDownloadURL(storageRef);
                    updateObj.photoURL = photoURL;
                    setPhotoPreview(photoURL);
                    
                    // Also update Firebase Auth profile
                    await updateFirebaseProfile(auth.currentUser, { photoURL });
                } catch (photoError) {
                    toast.warning("Profile saved but photo upload failed");
                }
            }

            await updateDoc(doc(db, "users", user.uid), updateObj);
            clearTimeout(timeoutId);
            setDisplayUser(prev => ({ ...prev, ...updateObj }));
            setPhotoFile(null);
            setEditLoading(false);
            setEditOpen(false);
            
            // Refresh user context to update profile image everywhere
            await refreshUser(user.uid);
            
            toast.success("Profile updated successfully!");
        } catch (error) {
            clearTimeout(timeoutId);
            setEditLoading(false);
            toast.error(error?.message || "Failed to update profile.");
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#f3f2ef] w-full min-h-screen pt-8 pb-16">
            <div className="max-w-[1200px] mx-auto px-0 sm:px-4">
                <div className="space-y-6">

                        {/* 1. Intro Card */}
                        <Card className="overflow-hidden border-slate-300/60 shadow-none rounded-lg bg-white relative">
                            <div className="h-[200px] relative bg-slate-200 w-full group">
                                {displayUser?.coverPhotoURL ? (
                                    <img src={displayUser.coverPhotoURL} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="w-full h-full gradient-primary" />
                                )}
                                {isOwnProfile && (
                                    <>
                                        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => coverInputRef.current?.click()}
                                            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 h-8 font-semibold rounded-full shadow-sm"
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Edit background
                                        </Button>
                                    </>
                                )}
                            </div>

                            <CardContent className="px-6 pb-6 relative">
                                <div className="flex justify-between items-start">
                                    <div className="relative">
                                        <PhotoUploadFixed
                                          currentPhoto={displayUser?.photoURL}
                                          onPhotoUpdate={async (photoURL) => {
                                            console.log('Profile photo update callback:', photoURL);
                                            setDisplayUser(prev => ({ ...prev, photoURL }));
                                            if (isOwnProfile) {
                                              // Update Firestore
                                              console.log('Saving photoURL to Firestore:', photoURL);
                                              await updateDoc(doc(db, "users", user.uid), { photoURL });
                                              
                                              // Update Firebase Auth for persistence
                                              try {
                                                await updateFirebaseProfile(auth.currentUser, { photoURL });
                                                console.log('Firebase Auth profile updated with photo');
                                              } catch (authError) {
                                                console.error('Failed to update Firebase Auth profile:', authError);
                                              }
                                              
                                              // Refresh user context
                                              await refreshUser();
                                            }
                                          }}
                                          user={user}
                                        />
                                    </div>

                                    <div className="ml-auto mt-4 flex gap-2">
                                        {isOwnProfile ? (
                                            <>
                                                <Button variant="outline" className="rounded-full px-4 font-semibold border-slate-400 text-slate-600 hover:bg-slate-50 hover:border-slate-500" onClick={() => setEditOpen(true)}>
                                                    Add profile section
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100 text-slate-600" onClick={() => setEditOpen(true)}>
                                                    <PenTool className="h-5 w-5" />
                                                </Button>
                                            </>
                                        ) : null}
                                    </div>

                                    {/* Show profile summary for other users (like LinkedIn) */}
                                    {!isOwnProfile && (
                                        <div className="mt-4 flex gap-2">
                                            <Button className="rounded-full px-5 bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold shadow-none text-base h-9" onClick={() => handleMessage(displayUser.uid)}>
                                                <MessageCircle className="h-4 w-4 mr-2" /> Message
                                            </Button>
                                            <Button variant="outline" className="rounded-full px-5 font-semibold border-[#0a66c2] text-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2 hover:border-[#0a66c2] shadow-none text-base h-9" onClick={handleConnect}>
                                                Connect
                                            </Button>
                                            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-slate-500 text-slate-600 hover:bg-slate-100 hover:border-slate-600" onClick={() => toast.info('More options coming soon')}>
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )}

                                    {!isOwnProfile && displayUser?.bio && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                            <p className="text-sm text-slate-700 leading-relaxed">{displayUser.bio}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-[72px] sm:mt-[68px]">
                                    <div className="flex justify-between items-start">
                                        <div className="max-w-[75%]">
                                            <h1 className="text-2xl font-semibold text-slate-900 leading-tight">{displayUser?.name || "Member"}</h1>
                                            <p className="text-base text-slate-800 mt-[2px]">{displayUser?.role || "Alumni"} at {displayUser?.company || displayUser?.department || "L.D. College of Engineering"}</p>

                                            <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                                                {displayUser?.location ? <span>{displayUser.location}</span> : <span>Ahmedabad, Gujarat, India</span>}
                                                <span className="mx-1">•</span>
                                                <a href="#info" className="text-[#0a66c2] font-semibold hover:underline">Contact info</a>
                                            </div>

                                            <a href="#network" className="text-[#0a66c2] font-semibold hover:underline text-sm inline-block mt-2 cursor-pointer" onClick={() => navigate('/connections')}>
                                                {connectionDetails.length} connections
                                            </a>
                                        </div>

                                        <div className="text-sm font-semibold flex items-center gap-2 hover:underline cursor-pointer group pr-4">
                                            <div className="bg-slate-100 p-2 rounded shrink-0">
                                                <GraduationCap className="h-5 w-5 text-slate-700" />
                                            </div>
                                            <span className="text-slate-900 line-clamp-2">L.D. College of Engineering</span>
                                        </div>
                                    </div>

                                    {(displayUser?.portfolioUrl || displayUser?.linkedinUrl || displayUser?.twitterUrl) && (
                                        <div className="flex gap-4 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 w-fit">
                                            {displayUser?.portfolioUrl && (
                                                <a href={displayUser.portfolioUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-600 hover:text-[#0a66c2] hover:underline flex items-center gap-1">
                                                    Portfolio <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {displayUser?.linkedinUrl && (
                                                <a href={displayUser.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-600 hover:text-[#0a66c2] hover:underline flex items-center gap-1">
                                                    LinkedIn <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. About Card - Only show for own profile or if user has bio */}
                        {(isOwnProfile || displayUser?.bio) && (
                            <>
                            <Card className="border-slate-300/60 shadow-none rounded-lg bg-white">
                                <CardHeader className="px-6 py-4 pb-2 flex flex-row items-center justify-between border-0">
                                    <CardTitle className="text-xl font-semibold text-slate-900">About</CardTitle>
                                    {isOwnProfile && (
                                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-slate-100 text-slate-600" onClick={() => setEditOpen(true)}>
                                            <PenTool className="h-5 w-5" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    {displayUser?.bio ? (
                                        <p className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">{displayUser.bio}</p>
                                    ) : isOwnProfile ? (
                                        <p className="text-[15px] text-slate-500 italic">Add a summary to highlight your personality or work experience.</p>
                                    ) : null}
                                </CardContent>
                            </Card>

                            {/* 3. Activity & Contributions */}
                            <Card className="border-slate-300/60 shadow-none rounded-lg bg-white">
                                <CardHeader className="px-6 py-4 pb-2 flex flex-row items-center justify-between border-0 pt-5">
                                    <CardTitle className="text-xl font-semibold text-slate-900">Activity</CardTitle>
                                    <div className="flex gap-2">
                                        {isOwnProfile && (
                                            <Button variant="outline" className="rounded-full px-4 font-semibold border-[#0a66c2] text-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2 shadow-none text-[15px] h-9" onClick={() => navigate('/feed')}>
                                                Create Post
                                            </Button>
                                        )}
                                        <Button variant="outline" className="rounded-full px-4 font-semibold border-[#0a66c2] text-[#0a66c2] hover:bg-[#ebf4fd] hover:border-2 shadow-none text-[15px] h-9" onClick={() => navigate('/feed')}>
                                            View Feed
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 mt-2">
                                    <Tabs defaultValue="posts" className="w-full">
                                        <TabsList className="w-full justify-start rounded-none border-b border-slate-200 bg-transparent p-0 pl-6 h-auto">
                                            <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#01754f] data-[state=active]:bg-transparent data-[state=active]:text-[#01754f] data-[state=active]:shadow-none px-4 py-3 font-semibold text-[15px] hover:bg-slate-50 transition-colors">My Feed</TabsTrigger>
                                            <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#01754f] data-[state=active]:bg-transparent data-[state=active]:text-[#01754f] data-[state=active]:shadow-none px-4 py-3 font-semibold text-[15px] hover:bg-slate-50 transition-colors">My Events</TabsTrigger>
                                            <TabsTrigger value="challenges" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#01754f] data-[state=active]:bg-transparent data-[state=active]:text-[#01754f] data-[state=active]:shadow-none px-4 py-3 font-semibold text-[15px] hover:bg-slate-50 transition-colors">My Challenges</TabsTrigger>
                                            <TabsTrigger value="opportunities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#01754f] data-[state=active]:bg-transparent data-[state=active]:text-[#01754f] data-[state=active]:shadow-none px-4 py-3 font-semibold text-[15px] hover:bg-slate-50 transition-colors">My Opportunities</TabsTrigger>
                                        </TabsList>

                                        <div className="p-0">
                                            {/* Posts Tab */}
                                            <TabsContent value="posts" className="m-0 focus-visible:outline-none">
                                                {myPosts.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-[15px]">You haven't posted anything yet.</div>
                                                ) : (
                                                    <div className="divide-y divide-slate-200 border-b border-slate-200">
                                                        {myPosts.slice(0, 3).map((post) => (
                                                            <div key={post.id} className="p-6 pb-2">
                                                                <PostSimpleFixed
                                                                    post={post}
                                                                />
                                                            </div>
                                                        ))}
                                                        <Button variant="ghost" className="w-full rounded-none rounded-b-lg font-semibold text-slate-600 h-12 hover:bg-slate-100/50" onClick={() => navigate('/feed')}>
                                                            Show all activity <Activity className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* Events Tab */}
                                            <TabsContent value="events" className="m-0 focus-visible:outline-none">
                                                {myEvents.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-[15px]">
                                                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                        No events posted yet.
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-200">
                                                        {myEvents?.map((event) => (
                                                            <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                                                        <Calendar className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                                                        <p className="text-sm text-slate-600 mt-1">{event.date} • {event.type}</p>
                                                                        <div className="divide-y divide-slate-200 border-b border-slate-200">
                                                        {myPosts?.slice(0, 3).map((post) => (
                                                            <div key={post.id} className="p-6 pb-2">
                                                                <PostSimpleFixed
                                                                    post={post}
                                                                />
                                                            </div>
                                                        )) || <div className="p-8 text-center text-slate-500 text-[15px]">
                                                            <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                            <p className="text-slate-600">No posts yet.</p>
                                                        </div>}
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* Challenges Tab */}
                                            <TabsContent value="challenges" className="m-0 focus-visible:outline-none">
                                                {myChallenges.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-[15px]">
                                                        <Award className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                        No challenges posted yet.
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-200">
                                                        {myChallenges.map((challenge) => (
                                                            <div key={challenge.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                                                        <Award className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-slate-900">{challenge.title}</h4>
                                                                        <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-xs text-slate-500">{challenge.participants} participants</span>
                                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                                challenge.status === 'Active' 
                                                                                    ? 'bg-green-100 text-green-700' 
                                                                                    : 'bg-gray-100 text-gray-700'
                                                                            }`}>
                                                                                {challenge.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <a href={challenge.registrationLink} target="_blank" rel="noreferrer" className="text-sm text-slate-600 hover:text-[#0a66c2] hover:underline flex items-center gap-1">
                                                                                Register Now <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                            <span className="text-xs text-slate-500">{challenge.deadline}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-600">Posted by: {challenge.postedByName}</span>
                                                                            <span className="text-xs text-slate-500">{challenge.postedBy}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-600">Contact: {challenge.contactEmail}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-600">Requirements:</span>
                                                                            <ul className="list-disc pl-4 text-sm text-slate-600">
                                                                                {challenge.requirements?.map((requirement) => (
                                                                                    <li key={requirement}>{requirement}</li>
                                                                                )) || <li className="text-slate-400">No requirements specified</li>}
                                                                            </ul>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-600">Benefits:</span>
                                                                            <ul className="list-disc pl-4 text-sm text-slate-600">
                                                                                {challenge.benefits?.map((benefit) => (
                                                                                    <li key={benefit}>{benefit}</li>
                                                                                )) || <li className="text-slate-400">No benefits specified</li>}
                                                                            </ul>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-600">Timeline:</span>
                                                                            <ul className="list-disc pl-4 text-sm text-slate-600">
                                                                                {challenge.timeline?.map((timeline) => (
                                                                                    <li key={timeline.date}>{timeline.date} - {timeline.description}</li>
                                                                                )) || <li className="text-slate-400">No timeline specified</li>}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleChallengeClick(challenge)}>
                                                                        View Details
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* Opportunities Tab */}
                                            <TabsContent value="opportunities" className="m-0 focus-visible:outline-none">
                                                {myOpportunities.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-[15px]">
                                                        <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                        No opportunities posted yet.
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-200">
                                                        {myOpportunities.map((opp) => (
                                                            <div key={opp.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                                        <Briefcase className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-slate-900">{opp.title}</h4>
                                                                        <p className="text-sm text-slate-600 mt-1">{opp.company}</p>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-xs text-slate-500">{opp.type}</span>
                                                                            <span className="text-xs text-slate-500">{opp.location}</span>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="outline" size="sm" className="shrink-0">
                                                                        View Details
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </CardContent>
                            </Card>
                            </>
                        )}

                        {/* 4. Experience & Education */}
                        <Card className="border-slate-300/60 shadow-none rounded-lg bg-white">
                            <CardHeader className="px-6 py-4 pb-2 flex flex-row items-center justify-between border-0 pt-5">
                                <CardTitle className="text-xl font-semibold text-slate-900">Experience</CardTitle>
                                {isOwnProfile && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-slate-100 text-slate-600" onClick={() => setExperienceOpen(true)}><Plus className="h-6 w-6" /></Button>
                                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-slate-100 text-slate-600" onClick={() => setEditOpen(true)}><PenTool className="h-5 w-5" /></Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="px-6 pb-6 border-b border-slate-200">
                                {displayUser?.company ? (
                                    <div className="flex gap-4">
                                        <div className="mt-1 shrink-0">
                                            <div className="h-12 w-12 bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                                <Briefcase className="h-6 w-6 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <h3 className="text-base font-semibold text-slate-900 leading-tight">{displayUser.role || "Professional"}</h3>
                                            <p className="text-[15px] text-slate-800">{displayUser.company}</p>
                                            <p className="text-sm text-slate-500 mt-1">Full-time • Present</p>
                                            {displayUser.achievement && <p className="text-[15px] text-slate-800 mt-3 whitespace-pre-wrap">{displayUser.achievement}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[15px] text-slate-500 italic">No professional experience listed.</p>
                                )}
                            </CardContent>

                            <CardHeader className="px-6 py-4 pb-2 flex flex-row items-center justify-between border-0 pt-5">
                                <CardTitle className="text-xl font-semibold text-slate-900">Education</CardTitle>
                                {isOwnProfile && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-slate-100 text-slate-600" onClick={() => setEducationOpen(true)}><Plus className="h-6 w-6" /></Button>
                                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-slate-100 text-slate-600" onClick={() => setEditOpen(true)}><PenTool className="h-5 w-5" /></Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 shrink-0">
                                        <div className="h-12 w-12 bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                            <span className="font-extrabold text-slate-800 tracking-tighter">LDCE</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <h3 className="text-base font-semibold text-slate-900 leading-tight">L.D. College of Engineering</h3>
                                        <p className="text-[15px] text-slate-800">{displayUser?.department || "Bachelor's Degree"}</p>
                                        <p className="text-sm text-slate-500 mt-1">Founding Batch {displayUser?.graduationYear}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                {/* Connections List Dialog */}
                <Dialog open={connectionsOpen} onOpenChange={setConnectionsOpen}>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto px-0 bg-white shadow-xl rounded-xl">
                        <DialogHeader className="px-6 py-4 border-b border-slate-200">
                            <DialogTitle className="text-xl font-semibold text-slate-800">Connections</DialogTitle>
                        </DialogHeader>
                        <div className="p-2">
                            {connectionDetails.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p>No connections found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {connectionDetails.map((con) => (
                                        <div key={con.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg group">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setConnectionsOpen(false); navigate(`/profile/${con.partnerId}`); }}>
                                                <Avatar className="h-14 w-14 border border-slate-200 shadow-sm">
                                                    <AvatarImage src={con.photoURL} alt={con.name} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{con.name?.[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <h3 className="font-bold text-slate-900 text-base group-hover:underline group-hover:text-[#0a66c2]">{con.name}</h3>
                                                    <p className="text-xs text-slate-500 leading-tight">{con.role} at {con.company || con.department}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="rounded-full h-8 px-4 border-[#0a66c2] text-[#0a66c2] font-semibold hover:bg-[#ebf4fd] hover:border-[#0a66c2]" onClick={() => handleMessage(con.partnerId)}>
                                                Message
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Profile Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto px-0 bg-white shadow-xl rounded-xl">
                        <DialogHeader className="px-6 py-4 border-b border-slate-200">
                            <DialogTitle className="text-xl font-semibold text-slate-800">Edit intro</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-6 px-6 py-4">
                            <p className="text-xs text-slate-500">* Indicates required</p>

                            {/* Photo Upload */}
                            <div className="space-y-3">
                                <Label className="font-semibold text-slate-700">Profile Photo</Label>
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24 border-2 border-slate-200">
                                        <AvatarImage src={photoPreview} />
                                        <AvatarFallback className="text-3xl bg-slate-100">{editData.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                        <Button type="button" variant="outline" className="border-[#0a66c2] text-[#0a66c2] hover:bg-[#ebf4fd] hover:border-[#0a66c2] font-semibold rounded-full px-5" onClick={() => fileInputRef.current?.click()}>
                                            {photoFile ? "Change Photo" : "Add Photo"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="name" className="font-semibold text-slate-700">Full name *</Label>
                                    <Input id="name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="border-slate-500 text-[15px] h-10 rounded focus-visible:ring-[#0a66c2]" required />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="company" className="font-semibold text-slate-700">Current company</Label>
                                    <Input id="company" value={editData.company} onChange={(e) => setEditData({ ...editData, company: e.target.value })} className="border-slate-500 text-[15px] h-10 rounded focus-visible:ring-[#0a66c2]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="font-semibold text-slate-700">Headline</Label>
                                <textarea id="bio" value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-[#0a66c2] resize-none text-[15px]" rows={3} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="achievement" className="font-semibold text-slate-700">Experience summary</Label>
                                <textarea id="achievement" value={editData.achievement} onChange={(e) => setEditData({ ...editData, achievement: e.target.value })} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-[#0a66c2] resize-none text-[15px]" rows={4} />
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="font-semibold text-slate-800 mb-4 text-lg">Contact info</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin" className="font-semibold text-slate-700">LinkedIn Profile</Label>
                                        <Input id="linkedin" type="url" value={editData.linkedinUrl} onChange={(e) => setEditData({ ...editData, linkedinUrl: e.target.value })} className="border-slate-500 text-[15px] h-10 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="portfolio" className="font-semibold text-slate-700">Personal Website</Label>
                                        <Input id="portfolio" type="url" value={editData.portfolioUrl} onChange={(e) => setEditData({ ...editData, portfolioUrl: e.target.value })} className="border-slate-500 text-[15px] h-10 rounded" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 pb-2">
                                <Button type="button" variant="ghost" className="font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-5" onClick={() => setEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editLoading} className="font-semibold bg-[#0a66c2] hover:bg-[#004182] text-white rounded-full px-6">
                                    {editLoading ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
                
                <ExperienceModal open={experienceOpen} onOpenChange={setExperienceOpen} />
                <EducationModal open={educationOpen} onOpenChange={setEducationOpen} />
                <ChallengeDetailsModal open={challengeDetailsOpen} onOpenChange={setChallengeDetailsOpen} challenge={selectedChallenge} />
            </div>
        </div>
    );
};

export default Profile;
