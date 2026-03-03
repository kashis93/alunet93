import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { toast } from "sonner";

const ExperienceModal = ({ open, onOpenChange }) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [experience, setExperience] = useState({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                experience: {
                    ...experience,
                    addedAt: new Date().toISOString()
                }
            });
            
            await refreshUser();
            toast.success("Experience added successfully!");
            onOpenChange(false);
            
            // Reset form
            setExperience({
                title: "",
                company: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: ""
            });
        } catch (error) {
            console.error("Error adding experience:", error);
            toast.error("Failed to add experience");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Experience</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <input
                            type="text"
                            required
                            value={experience.title}
                            onChange={(e) => setExperience({...experience, title: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Company</label>
                        <input
                            type="text"
                            required
                            value={experience.company}
                            onChange={(e) => setExperience({...experience, company: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Google"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Location</label>
                        <input
                            type="text"
                            value={experience.location}
                            onChange={(e) => setExperience({...experience, location: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Bangalore, India"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="month"
                                required
                                value={experience.startDate}
                                onChange={(e) => setExperience({...experience, startDate: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="month"
                                value={experience.endDate}
                                onChange={(e) => setExperience({...experience, endDate: e.target.value})}
                                disabled={experience.current}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="current"
                            checked={experience.current}
                            onChange={(e) => setExperience({...experience, current: e.target.checked, endDate: ""})}
                            className="mr-2"
                        />
                        <label htmlFor="current" className="text-sm">I currently work here</label>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            value={experience.description}
                            onChange={(e) => setExperience({...experience, description: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe your role and achievements..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? "Adding..." : "Add Experience"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ExperienceModal;
