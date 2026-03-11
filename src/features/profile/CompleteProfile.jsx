import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/services/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Progress } from "@/components/ui";
import { Badge } from "@/components/ui";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Briefcase, GraduationCap, Link2, CheckCircle, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

const CompleteProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    bio: "",
    location: "",
    
    // Professional Info
    role: "",
    company: "",
    department: "",
    graduationYear: "",
    
    // Links
    portfolioUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    
    // Additional Info
    skills: [],
    interests: "",
    achievements: "",
    isMentor: false,
    membershipType: "Basic"
  });

  const steps = [
    {
      title: "Basic Information",
      icon: User,
      fields: ["name", "bio", "location"]
    },
    {
      title: "Professional Details",
      icon: Briefcase,
      fields: ["role", "company", "department", "graduationYear"]
    },
    {
      title: "Social Links",
      icon: Link2,
      fields: ["portfolioUrl", "linkedinUrl", "twitterUrl"]
    },
    {
      title: "Additional Info",
      icon: GraduationCap,
      fields: ["skills", "interests", "achievements", "isMentor"]
    }
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => 
      value !== "" && value !== null && value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
    const totalFields = Object.keys(formData).length;
    setProgress((filledFields / totalFields) * 100);
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateFirebaseProfile(auth.currentUser, {
        displayName: formData.name
      });

      // Update Firestore document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...formData,
        isProfileComplete: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Refresh user context
      await refreshUser();
      
      toast.success("Profile completed successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error("Failed to complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
                className="mt-2"
              />
            </div>
          </div>
        );
        
      case 1: // Professional Details
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="role">Current Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                placeholder="e.g. Software Engineer"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company/Organization</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Where do you work?"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                value={formData.graduationYear}
                onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                placeholder="e.g. 2020"
                type="number"
                min="1950"
                max="2030"
                className="mt-2"
              />
            </div>
          </div>
        );
        
      case 2: // Social Links
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                placeholder="https://yourportfolio.com"
                type="url"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                type="url"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                value={formData.twitterUrl}
                onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                type="url"
                className="mt-2"
              />
            </div>
          </div>
        );
        
      case 3: // Additional Info
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="React, Node.js, Python, etc."
                className="mt-2"
              />
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="interests">Interests</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange("interests", e.target.value)}
                placeholder="What are you interested in?"
                rows={3}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => handleInputChange("achievements", e.target.value)}
                placeholder="Your notable achievements..."
                rows={3}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMentor"
                checked={formData.isMentor}
                onChange={(e) => handleInputChange("isMentor", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isMentor">I'm willing to mentor other alumni</Label>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Please log in to complete your profile.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600">Help us get to know you better by filling out your profile information.</p>
      </motion.div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              index <= currentStep 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}>
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-full h-1 mx-2 ${
                index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      Complete Profile <Save className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
