import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button, Input, Label } from '@/components/ui';
import { GraduationCap, Mail, Lock, User, Building, Briefcase, Award } from 'lucide-react';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    graduationYear: '',
    department: 'CSE',
    company: '',
    achievement: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.graduationYear || !formData.company) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update Firebase Auth profile with display name
      await updateProfile(user, {
        displayName: formData.name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        graduationYear: formData.graduationYear,
        department: formData.department,
        company: formData.company,
        achievement: formData.achievement,
        role: 'Alumni', // Always Alumni
        photoURL: null,
        bio: '',
        portfolioUrl: '',
        linkedinUrl: '',
        twitterUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isProfileComplete: false
      });

      console.log('User created successfully');
      toast.success('Account created successfully! Please complete your profile.');
      
      // Navigate to complete profile
      navigate('/complete-profile');
      
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please sign in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Join Alumni Network
            </CardTitle>
            <CardDescription>
              Create your account to connect with fellow alumni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Graduation Year *
                </Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder="e.g., 2020"
                  min="1950"
                  max="2030"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Department
                </Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
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
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Current Company *
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Where do you work now?"
                  required
                />
              </div>

              {/* Achievement */}
              <div className="space-y-2">
                <Label htmlFor="achievement" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Achievement *
                </Label>
                <Input
                  id="achievement"
                  type="text"
                  value={formData.achievement}
                  onChange={(e) => handleInputChange('achievement', e.target.value)}
                  placeholder="Your biggest achievement"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
