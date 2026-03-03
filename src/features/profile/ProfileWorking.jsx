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
import { alumni as dummyAlumni } from "@/data/dummyData.js";
import noteworthyAlumniRaw from "@/data/noteworthyAlumni.json";

const ProfileWorking = () => {
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

    useEffect(() => {
        if (isOwnProfile && user) {
            setPhotoPreview(user.photoURL);
            setBackgroundImage(user.backgroundImage || null);
            setEditData({
                name: user.displayName || "",
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

        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
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
                    const noteworthyUser = noteworthyAlumniRaw.find(u => u.id === nwId);
                    if (noteworthyUser) {
                        staticUser = {
                            uid: profileUserId,
                            ...noteworthyUser,
                            displayName: noteworthyUser.name,
                            email: noteworthyUser.email || "contact@example.com",
                            photoURL: noteworthyUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(noteworthyUser.name)}&background=random`,
                            role: noteworthyUser.role || "Alumni",
                            company: noteworthyUser.company || "",
                            bio: noteworthyUser.bio || "",
                            graduationYear: noteworthyUser.graduationYear || "",
                            department: noteworthyUser.department || ""
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

        // Load posts for this user
        if (profileUserId) {
            const postsQuery = query(
                collection(db, "posts"),
                where("authorId", "==", profileUserId),
                orderBy("createdAt", "desc"),
                limit(10)
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

            return () => {
                unsubscribeProfile();
                unsubscribePosts();
            };
        }

        return () => unsubscribeProfile();
    }, [profileUserId]);

    const handlePhotoUpload = async (file) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Photo size should be less than 5MB");
            return;
        }

        try {
            setEditLoading(true);
            const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            // Update Firebase Auth profile
            await updateFirebaseProfile(auth.currentUser, {
                photoURL: photoURL
            });

            // Update Firestore user document
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                photoURL: photoURL
            });

            setPhotoPreview(photoURL);
            await refreshUser();
            toast.success("Profile photo updated successfully!");
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast.error("Failed to update profile photo");
        } finally {
            setEditLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setEditLoading(true);

        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                displayName: editData.name,
                bio: editData.bio,
                company: editData.company,
                achievement: editData.achievement,
                portfolioUrl: editData.portfolioUrl,
                linkedinUrl: editData.linkedinUrl,
                twitterUrl: editData.twitterUrl,
                updatedAt: new Date()
            });

            // Update Firebase Auth profile
            await updateFirebaseProfile(auth.currentUser, {
                displayName: editData.name
            });

            await refreshUser();
            toast.success("Profile updated successfully!");
            setEditOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!displayUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h3>
                    <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Profile Header */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={photoPreview} alt={displayUser.displayName} />
                                    <AvatarFallback>
                                        {displayUser.displayName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {isOwnProfile && (
                                    <Button
                                        size="sm"
                                        className="absolute bottom-0 right-0 rounded-full"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePhotoUpload(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {displayUser.displayName}
                                </h1>
                                <p className="text-gray-600 mb-4">{displayUser.bio || 'No bio available'}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayUser.company && (
                                        <div className="flex items-center space-x-2">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{displayUser.company}</span>
                                        </div>
                                    )}
                                    {displayUser.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{displayUser.email}</span>
                                        </div>
                                    )}
                                    {displayUser.graduationYear && (
                                        <div className="flex items-center space-x-2">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Class of {displayUser.graduationYear}</span>
                                        </div>
                                    )}
                                    {displayUser.department && (
                                        <div className="flex items-center space-x-2">
                                            <Award className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{displayUser.department}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="posts" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="posts">Posts ({counts.posts})</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="posts" className="space-y-4">
                                {myPosts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                                        <p className="text-gray-600">Share your thoughts with the alumni community.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myPosts.slice(0, 3).map((post) => (
                                            <div key={post.id} className="p-6 pb-2">
                                                <PostSimpleFixed post={post} />
                                            </div>
                                        ))}
                                        {myPosts.length > 3 && (
                                            <Button 
                                                variant="outline" 
                                                className="w-full" 
                                                onClick={() => navigate('/feed')}
                                            >
                                                Show all activity <Activity className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="about" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Bio</Label>
                                                <p className="text-gray-600">{displayUser.bio || 'No bio available'}</p>
                                            </div>
                                            {displayUser.company && (
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">Company</Label>
                                                    <p className="text-gray-600">{displayUser.company}</p>
                                                </div>
                                            )}
                                            {displayUser.graduationYear && (
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">Graduation Year</Label>
                                                    <p className="text-gray-600">{displayUser.graduationYear}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            
                            <TabsContent value="activity" className="space-y-4">
                                <div className="text-center py-8">
                                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
                                    <p className="text-gray-600">No recent activity to show.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" onClick={() => navigate('/feed')}>
                                    <Activity className="w-4 h-4 mr-2" />
                                    View Feed
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/events')}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Browse Events
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/challenges')}>
                                    <Award className="w-4 h-4 mr-2" />
                                    View Challenges
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <EditProfileModal 
                    open={editOpen} 
                    onOpenChange={setEditOpen}
                    user={user}
                    onSave={handleSaveProfile}
                />
                
                <ExperienceModal open={experienceOpen} onOpenChange={setExperienceOpen} />
                <EducationModal open={educationOpen} onOpenChange={setEducationOpen} />
                <ChallengeDetailsModal open={challengeDetailsOpen} onOpenChange={setChallengeDetailsOpen} challenge={selectedChallenge} />
            </div>
        </div>
    );
};

export default ProfileWorking;
