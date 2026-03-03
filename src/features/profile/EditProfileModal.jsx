import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { User, Mail, MapPin, Briefcase, Link as LinkIcon, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { toast } from "sonner";

const EditProfileModal = ({ open, onOpenChange }) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || user?.displayName || "",
        bio: user?.bio || "",
        company: user?.company || "",
        achievement: user?.achievement || "",
        portfolioUrl: user?.portfolioUrl || "",
        linkedinUrl: user?.linkedinUrl || "",
        twitterUrl: user?.twitterUrl || ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, editData);
            
            await refreshUser();
            toast.success("Profile updated successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="font-semibold text-slate-700">Full Name</label>
                        <input 
                            id="name" 
                            type="text" 
                            value={editData.name} 
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="bio" className="font-semibold text-slate-700">Bio</label>
                        <textarea 
                            id="bio" 
                            value={editData.bio} 
                            onChange={(e) => setEditData({ ...editData, bio: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            rows={3}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="company" className="font-semibold text-slate-700">Company</label>
                        <input 
                            id="company" 
                            type="text" 
                            value={editData.company} 
                            onChange={(e) => setEditData({ ...editData, company: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Where you work"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="achievement" className="font-semibold text-slate-700">Achievements</label>
                        <textarea 
                            id="achievement" 
                            value={editData.achievement} 
                            onChange={(e) => setEditData({ ...editData, achievement: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            rows={3}
                            placeholder="Your key achievements..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="portfolio" className="font-semibold text-slate-700">Portfolio URL</label>
                        <input 
                            id="portfolio" 
                            type="url" 
                            value={editData.portfolioUrl} 
                            onChange={(e) => setEditData({ ...editData, portfolioUrl: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="https://yourportfolio.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="linkedin" className="font-semibold text-slate-700">LinkedIn URL</label>
                        <input 
                            id="linkedin" 
                            type="url" 
                            value={editData.linkedinUrl} 
                            onChange={(e) => setEditData({ ...editData, linkedinUrl: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="https://linkedin.com/in/yourprofile"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="twitter" className="font-semibold text-slate-700">Twitter URL</label>
                        <input 
                            id="twitter" 
                            type="url" 
                            value={editData.twitterUrl} 
                            onChange={(e) => setEditData({ ...editData, twitterUrl: e.target.value })} 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="https://twitter.com/yourhandle"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;
