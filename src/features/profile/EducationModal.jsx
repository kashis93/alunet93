import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { GraduationCap, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { toast } from "sonner";

const EducationModal = ({ open, onOpenChange }) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [education, setEducation] = useState({
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
        activities: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                education: {
                    ...education,
                    addedAt: new Date().toISOString()
                }
            });
            
            await refreshUser();
            toast.success("Education added successfully!");
            onOpenChange(false);
            
            // Reset form
            setEducation({
                institution: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                current: false,
                gpa: "",
                activities: ""
            });
        } catch (error) {
            console.error("Error adding education:", error);
            toast.error("Failed to add education");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Education</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Institution</label>
                        <input
                            type="text"
                            required
                            value={education.institution}
                            onChange={(e) => setEducation({...education, institution: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. L.D. College of Engineering"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Degree</label>
                            <input
                                type="text"
                                required
                                value={education.degree}
                                onChange={(e) => setEducation({...education, degree: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Bachelor of Engineering"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">Field of Study</label>
                            <input
                                type="text"
                                required
                                value={education.field}
                                onChange={(e) => setEducation({...education, field: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Computer Engineering"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="month"
                                required
                                value={education.startDate}
                                onChange={(e) => setEducation({...education, startDate: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="month"
                                value={education.endDate}
                                onChange={(e) => setEducation({...education, endDate: e.target.value})}
                                disabled={education.current}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="current"
                            checked={education.current}
                            onChange={(e) => setEducation({...education, current: e.target.checked, endDate: ""})}
                            className="mr-2"
                        />
                        <label htmlFor="current" className="text-sm">I currently study here</label>
                    </div>

                    <div>
                        <label className="text-sm font-medium">GPA (Optional)</label>
                        <input
                            type="text"
                            value={education.gpa}
                            onChange={(e) => setEducation({...education, gpa: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 8.5/10"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Activities & Societies (Optional)</label>
                        <textarea
                            value={education.activities}
                            onChange={(e) => setEducation({...education, activities: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="e.g. Member of Computer Society, Cricket team, etc."
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
                            {loading ? "Adding..." : "Add Education"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EducationModal;
