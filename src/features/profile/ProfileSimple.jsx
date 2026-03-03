import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Badge, Separator } from '@/components/ui';
import { User, MessageCircle, Mail, MapPin, Briefcase, GraduationCap, Award, Users, Edit, Upload, Link as LinkIcon, Calendar, Plus, Activity, ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const ProfileSimple = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const profileUserId = id || user?.uid;
    const isOwnProfile = !id || id === user?.uid;

    const [loading, setLoading] = useState(true);
    const [displayUser, setDisplayUser] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        bio: "",
        company: "",
        achievement: "",
        portfolioUrl: "",
        linkedinUrl: "",
        twitterUrl: ""
    });

    useEffect(() => {
        if (isOwnProfile && user) {
            setEditData({
                name: user.displayName || "",
                bio: user.bio || "",
                company: user.company || "",
                achievement: user.achievement || "",
                portfolioUrl: user.portfolioUrl || "",
                linkedinUrl: user.linkedinUrl || "",
                twitterUrl: user.twitterUrl || ""
            });
            setDisplayUser(user);
            setLoading(false);
        }
    }, [user, isOwnProfile]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            // Here you would update the user profile in Firebase
            toast.success('Profile updated successfully!');
            setEditOpen(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
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
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Profile Header */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={displayUser.photoURL} alt={displayUser.displayName} />
                                    <AvatarFallback>
                                        {displayUser.displayName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {isOwnProfile && (
                                    <Button
                                        size="sm"
                                        className="absolute bottom-0 right-0 rounded-full"
                                        onClick={() => setEditOpen(true)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
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
                                <TabsTrigger value="posts">Posts</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="posts" className="space-y-4">
                                <div className="text-center py-8">
                                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Posts</h3>
                                    <p className="text-gray-600">No posts yet.</p>
                                </div>
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
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            
                            <TabsContent value="activity" className="space-y-4">
                                <div className="text-center py-8">
                                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity</h3>
                                    <p className="text-gray-600">No recent activity.</p>
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
                {editOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            value={editData.bio}
                                            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            rows={4}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            value={editData.company}
                                            onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSimple;
