import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { db, auth } from "@/services/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, Briefcase, Award, User, Upload } from "lucide-react";
import { uploadAsDataURL } from "@/utils/dataURLUpload";

const CompleteProfileFixed = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photoURL || null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || "",
    graduationYear: user?.graduationYear || "",
    department: user?.department || "CSE",
    company: user?.company || "",
    achievement: user?.achievement || "",
    role: "Alumni" // Always Alumni - no students in platform
  });

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
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photoFile || !user) return null;

    try {
      setUploading(true);
      console.log("Starting Data URL upload for profile photo");
      
      // Use Data URL instead of Firebase Storage to avoid CORS issues
      const result = await uploadAsDataURL(photoFile);
      console.log("Data URL upload successful:", result);
      
      return result.url;
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(`Failed to upload photo: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.graduationYear) {
      toast.error("Please enter your graduation year");
      return;
    }

    if (!formData.company.trim()) {
      toast.error("Please enter your company");
      return;
    }

    if (!formData.achievement.trim()) {
      toast.error("Please enter your achievement");
      return;
    }

    setLoading(true);
    try {
      let photoURL = user.photoURL || "";
      
      if (photoFile) {
        try {
          photoURL = await uploadPhoto();
        } catch (photoError) {
          console.warn("Photo upload failed, continuing without photo", photoError);
          toast.warning("Photo upload failed, but profile will be updated");
        }
      }

      const userRef = doc(db, "users", user.uid);
      const updateData = {
        name: formData.name,
        graduationYear: parseInt(formData.graduationYear),
        department: formData.department,
        company: formData.company,
        achievement: formData.achievement,
        role: formData.role,
        photoURL,
        updatedAt: new Date()
      };

      try {
        await updateDoc(userRef, updateData);
        
        // Update Firebase Auth profile with display name only (skip photoURL due to length limit)
        await updateAuthProfile(auth.currentUser, { 
          displayName: formData.name
          // photoURL: photoURL - REMOVED due to Firebase Auth length limit
        });
        
        console.log("Profile completed successfully");
        toast.success("Profile completed successfully!");
        await refreshUser();
        
        // Navigate to main profile page
        navigate("/profile");
        
      } catch (updateError) {
        console.error("Profile update error:", updateError);
        toast.error("Failed to update profile");
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              Please provide your information to complete your alumni profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 border-4 border-gray-200">
                  <AvatarImage src={photoPreview} />
                  <AvatarFallback className="text-lg">
                    {formData.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </div>
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  
                  {uploading && (
                    <div className="text-sm text-blue-600">
                      Uploading photo...
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                  placeholder="e.g., 2020"
                  min="1950"
                  max="2030"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CSE">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                </select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Current company"
                  required
                />
              </div>

              {/* Achievement */}
              <div className="space-y-2">
                <Label htmlFor="achievement">Achievement *</Label>
                <Input
                  id="achievement"
                  type="text"
                  value={formData.achievement}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))}
                  placeholder="e.g., Best Project Award, Research Publication"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || uploading}
                className="w-full"
              >
                {loading ? "Completing Profile..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfileFixed;
