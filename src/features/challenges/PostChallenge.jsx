import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import {
  ArrowLeft,
  DollarSign,
  Briefcase,
  Award,
  Users,
  Calendar,
  Building,
  GraduationCap,
  AlertCircle,
  Send,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

const PostChallenge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    batchYear: '',
    domain: '',
    description: '',
    problemStatement: '',
    skillsRequired: '',
    expectedDeliverables: '',
    cashReward: '',
    internshipReward: false,
    certificateReward: false,
    mentorshipReward: false,
    otherRewards: '',
    deadline: '',
    registrationLink: '',
    contactEmail: '',
    difficulty: 'beginner',
    duration: '1week',
    disclaimerAccepted: false
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to post a challenge');
      navigate('/challenges');
    }
  }, [user, navigate]);

  const domains = [
    'Technology', 'Business', 'Design', 'Marketing', 'Data Science', 'AI/ML',
    'Engineering', 'Finance', 'Healthcare', 'Education', 'Other'
  ];

  const batchYears = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i - 1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to post a challenge');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a challenge title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a short description');
      return;
    }

    if (!formData.problemStatement.trim()) {
      toast.error('Please enter a problem statement');
      return;
    }

    if (!formData.deadline) {
      toast.error('Please select a deadline');
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    if (!formData.batchYear) {
      toast.error('Please select your batch year');
      return;
    }

    if (!formData.domain) {
      toast.error('Please select a domain category');
      return;
    }

    if (!formData.registrationLink && !formData.contactEmail) {
      toast.error('Please provide either a registration link or contact email');
      return;
    }

    if (!formData.disclaimerAccepted) {
      toast.error('Please accept the disclaimer to continue');
      return;
    }

    setLoading(true);

    try {
      const challengesRef = collection(db, 'challenges');
      const challengeData = {
        ...formData,
        postedBy: user.uid,
        postedByName: user.displayName || user.name || 'Alumni',
        postedByPhoto: user.photoURL || '',
        linkedInProfile: user.linkedInProfile || '',
        createdAt: serverTimestamp(),
        status: 'Active'
      };

      const challengeDoc = await addDoc(challengesRef, challengeData);

      // Create real-time activity
      const activityData = {
        type: 'challenge_posted',
        title: `Posted a new challenge: ${formData.title}`,
        description: formData.problemStatement,
        authorId: user.uid,
        timestamp: serverTimestamp(),
        metadata: {
          challengeId: challengeDoc.id,
          domain: formData.domain,
          rewards: {
            cash: formData.cashReward,
            internship: formData.internshipReward,
            certificate: formData.certificateReward,
            mentorship: formData.mentorshipReward
          }
        }
      };

      await addDoc(collection(db, 'activities'), activityData);

      toast.success('Challenge posted successfully!');
      navigate('/challenges');
    } catch (error) {
      console.error('Error posting challenge:', error);
      toast.error('Failed to post challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Compact Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/challenges')}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1 font-['Inter', 'system-ui', 'sans-serif'] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Post a Challenge
              </h1>
              <p className="text-slate-600 font-['Inter', 'system-ui', 'sans-serif']">
                Share an opportunity with our talented alumni community
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-xs text-slate-600 font-medium">Quick Setup</span>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 rounded-full p-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-900">500+</div>
                  <div className="text-xs text-blue-700">Active Alumni</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 rounded-full p-1.5">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-green-900">50+</div>
                  <div className="text-xs text-green-700">Challenges Posted</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 rounded-full p-1.5">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-900">200+</div>
                  <div className="text-xs text-purple-700">Applications</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200/80 shadow-lg rounded-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">Challenge Details</CardTitle>
              <p className="text-slate-600 text-sm">Fill in the information below to post your challenge</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      </div>
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                          Challenge Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g. AI-Powered Healthcare Solution Challenge"
                          required
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                          Company Name *
                        </Label>
                        <Input
                          id="company"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="e.g. Google, Microsoft, Startup Name"
                          required
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="batch" className="block text-sm font-medium text-slate-700 mb-1">
                          Batch Year *
                        </Label>
                        <select
                          value={formData.batchYear}
                          onChange={(e) => handleInputChange('batchYear', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value="">Select your batch year</option>
                          {batchYears.map(year => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-1">
                          Domain Category *
                        </Label>
                        <select
                          value={formData.domain}
                          onChange={(e) => handleInputChange('domain', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value="">Select domain</option>
                          {domains.map(domain => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-1">
                              Difficulty Level *
                            </Label>
                            <select
                              value={formData.difficulty}
                              onChange={(e) => handleInputChange('difficulty', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              required
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">
                              Estimated Duration *
                            </Label>
                            <select
                              value={formData.duration}
                              onChange={(e) => handleInputChange('duration', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              required
                            >
                              <option value="24h">24h Hackathon</option>
                              <option value="1week">1 Week</option>
                              <option value="1month">1 Month</option>
                              <option value="flexible">Flexible</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      </div>
                      Challenge Details
                    </h3>

                    <div>
                      <Label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                        Short Description *
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="A brief overview of the challenge..."
                        required
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="problemStatement" className="block text-sm font-medium text-slate-700 mb-1">
                        Problem Statement *
                      </Label>
                      <Textarea
                        id="problemStatement"
                        value={formData.problemStatement}
                        onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                        placeholder="Describe the problem in detail, the context, and what you're looking for..."
                        rows={5}
                        required
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="skillsRequired" className="block text-sm font-medium text-slate-700 mb-1">
                        Skills Required
                      </Label>
                      <Textarea
                        id="skillsRequired"
                        value={formData.skillsRequired}
                        onChange={(e) => handleInputChange('skillsRequired', e.target.value)}
                        placeholder="List the technical and soft skills participants should have..."
                        rows={2}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expectedDeliverables" className="block text-sm font-medium text-slate-700 mb-1">
                        Expected Deliverables
                      </Label>
                      <Textarea
                        id="expectedDeliverables"
                        value={formData.expectedDeliverables}
                        onChange={(e) => handleInputChange('expectedDeliverables', e.target.value)}
                        placeholder="What should participants submit? (e.g., code repository, presentation, report, demo video...)"
                        rows={2}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      </div>
                      Challenge Rewards
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cashReward" className="block text-sm font-medium text-slate-700 mb-1">
                          Cash Amount (Optional)
                        </Label>
                        <Input
                          id="cashReward"
                          value={formData.cashReward}
                          onChange={(e) => handleInputChange('cashReward', e.target.value)}
                          placeholder="e.g. $1000, ₹50000"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="otherRewards" className="block text-sm font-medium text-slate-700 mb-1">
                          Other Benefits
                        </Label>
                        <Input
                          id="otherRewards"
                          value={formData.otherRewards}
                          onChange={(e) => handleInputChange('otherRewards', e.target.value)}
                          placeholder="e.g. Job opportunity, mentorship, swag"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="internship"
                          checked={formData.internshipReward}
                          onChange={(e) => handleInputChange('internshipReward', e.target.checked)}
                        />
                        <Label htmlFor="internship" className="text-sm font-medium text-slate-700">
                          <Briefcase className="inline h-4 w-4 mr-2" />
                          Internship Opportunity
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="certificate"
                          checked={formData.certificateReward}
                          onChange={(e) => handleInputChange('certificateReward', e.target.checked)}
                        />
                        <Label htmlFor="certificate" className="text-sm font-medium text-slate-700">
                          <Award className="inline h-4 w-4 mr-2" />
                          Certificate of Completion
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mentorship"
                          checked={formData.mentorshipReward}
                          onChange={(e) => handleInputChange('mentorshipReward', e.target.checked)}
                        />
                        <Label htmlFor="mentorship" className="text-sm font-medium text-slate-700">
                          <Users className="inline h-4 w-4 mr-2" />
                          1-on-1 Mentorship
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      </div>
                      Timeline
                    </h3>

                    <div>
                      <Label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1">
                        Application Deadline *
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                      </div>
                      Application Method
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="registrationLink" className="block text-sm font-medium text-slate-700 mb-1">
                          External Registration Link
                        </Label>
                        <Input
                          id="registrationLink"
                          type="url"
                          value={formData.registrationLink}
                          onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                          placeholder="https://forms.google.com/..."
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Students will apply directly through this link
                        </p>
                      </div>

                      <div className="text-center text-slate-500 text-sm">OR</div>

                      <div>
                        <Label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-1">
                          Contact Email Address
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          placeholder="email@example.com"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Students will contact you directly via email
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1 text-sm">Important Disclaimer</h4>
                          <p className="text-amber-800 text-xs mb-3">
                            AluVerse only provides the platform for listing challenges. We do not manage applications, verify submissions, or handle rewards. All communication and rewards are handled directly by you.
                          </p>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="disclaimer"
                              checked={formData.disclaimerAccepted}
                              onChange={(e) => handleInputChange('disclaimerAccepted', e.target.checked)}
                            />
                            <Label htmlFor="disclaimer" className="text-sm font-medium text-amber-900">
                              I understand that AluVerse only provides listing and does not manage this challenge.
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/challenges')}
                      className="flex-1 border-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                    >
                      {loading ? (
                        'Posting...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Challenge
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PostChallenge;
