import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Plus, 
  ExternalLink, 
  Mail, 
  FileText,
  AlertCircle,
  Clock,
  Target,
  Award,
  Lightbulb
} from 'lucide-react';

const ChallengesFixed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [posterDetails, setPosterDetails] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    description: '',
    category: '',
    deadline: '',
    contactEmail: '',
    contactForm: '',
    reward: '',
    tags: ''
  });

  useEffect(() => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Load real challenges from Firebase
    const challengesRef = collection(db, "challenges");
    const q = query(
      challengesRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challengesData = [];
      snapshot.forEach((doc) => {
        const challengeData = doc.data();
        challengesData.push({
          id: doc.id,
          ...challengeData,
          createdAt: challengeData.createdAt?.toDate?.() || new Date(challengeData.createdAt) || new Date(),
          deadline: challengeData.deadline?.toDate?.() || new Date(challengeData.deadline) || null
        });
      });
      setChallenges(challengesData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading challenges:", error);
      toast.error("Failed to load challenges");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Load poster details for challenges
    const loadPosterDetails = async () => {
      const details = {};
      for (const challenge of challenges) {
        if (challenge.alumniId && !details[challenge.alumniId]) {
          try {
            const userDoc = await getDoc(doc(db, "users", challenge.alumniId));
            if (userDoc.exists()) {
              details[challenge.alumniId] = userDoc.data();
            }
          } catch (error) {
            console.error("Error loading user details:", error);
          }
        }
      }
      setPosterDetails(details);
    };

    if (challenges.length > 0) {
      loadPosterDetails();
    }
  }, [challenges]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const challengesRef = collection(db, "challenges");
      const docRef = await addDoc(challengesRef, {
        ...formData,
        alumniId: user.uid,
        alumniName: user.displayName,
        alumniEmail: user.email,
        status: 'active',
        solutions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log("Challenge created with ID:", docRef.id);
      toast.success("Challenge posted successfully!");
      setShowCreateChallenge(false);
      
      // Reset form
      setFormData({
        title: '',
        problemStatement: '',
        description: '',
        category: '',
        deadline: '',
        contactEmail: '',
        contactForm: '',
        reward: '',
        tags: ''
      });
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Failed to post challenge");
    } finally {
      setLoading(false);
    }
  };

  const isChallengeActive = (deadline) => {
    if (!deadline) return true;
    return new Date(deadline) > new Date();
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Challenges</h1>
              <p className="text-gray-600">Real-world problems posted by alumni for students to solve</p>
            </div>
            <button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Post Challenge</span>
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            const poster = posterDetails[challenge.alumniId];
            const isActive = isChallengeActive(challenge.deadline);
            const daysRemaining = getDaysRemaining(challenge.deadline);

            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedChallenge(challenge)}
              >
                {/* Challenge Header */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Target className="h-16 w-16 text-white/50" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  {daysRemaining !== null && isActive && (
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {daysRemaining}
                        </div>
                        <div className="text-xs text-gray-600 uppercase">
                          days left
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Challenge Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {challenge.problemStatement || challenge.description}
                  </p>

                  {/* Challenge Meta */}
                  <div className="space-y-2">
                    {poster && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                          {poster.displayName?.charAt(0) || 'A'}
                        </div>
                        <span>{poster.displayName}</span>
                      </div>
                    )}

                    {challenge.category && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Lightbulb className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{challenge.category}</span>
                      </div>
                    )}

                    {challenge.reward && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{challenge.reward}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChallenge(challenge);
                    }}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {challenges.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No challenges posted yet</h3>
            <p className="text-gray-600 mb-6">Be the first to post a challenge for students to solve!</p>
            <button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Post Challenge
            </button>
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Post Challenge</h2>
                  <button
                    onClick={() => setShowCreateChallenge(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter challenge title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Statement *
                    </label>
                    <textarea
                      name="problemStatement"
                      value={formData.problemStatement}
                      onChange={handleInputChange}
                      placeholder="Clearly describe the problem you want students to solve..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide additional context, requirements, and expectations..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Challenge Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select category</option>
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="design">Design</option>
                      <option value="engineering">Engineering</option>
                      <option value="research">Research</option>
                      <option value="social">Social Impact</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward/Recognition
                    </label>
                    <input
                      type="text"
                      name="reward"
                      value={formData.reward}
                      onChange={handleInputChange}
                      placeholder="e.g., Certificate, Prize Money, Internship"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., AI, web development, sustainability"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Students can contact you directly via email</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Form Link (Optional)
                    </label>
                    <input
                      type="url"
                      name="contactForm"
                      value={formData.contactForm}
                      onChange={handleInputChange}
                      placeholder="https://forms.google.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Link to Google Form or other submission form</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateChallenge(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Posting...' : 'Post Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Challenge Details Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Problem Statement */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Problem Statement
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedChallenge.problemStatement}
                  </p>
                </div>

                {/* Detailed Description */}
                {selectedChallenge.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Detailed Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedChallenge.description}
                    </p>
                  </div>
                )}

                {/* Challenge Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-600" />
                      Challenge Information
                    </h3>
                    <div className="space-y-2">
                      {selectedChallenge.category && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-600 w-24">Category:</span>
                          <span className="capitalize">{selectedChallenge.category}</span>
                        </div>
                      )}
                      {selectedChallenge.deadline && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-600 w-24">Deadline:</span>
                          <span>{new Date(selectedChallenge.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedChallenge.reward && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-600 w-24">Reward:</span>
                          <span>{selectedChallenge.reward}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Posted By
                    </h3>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {posterDetails[selectedChallenge.alumniId]?.displayName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {posterDetails[selectedChallenge.alumniId]?.displayName || selectedChallenge.alumniName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {posterDetails[selectedChallenge.alumniId]?.email || selectedChallenge.alumniEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    How to Participate
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 mb-3">
                        Students can directly connect with the alumni to submit their solutions:
                      </p>
                      
                      {selectedChallenge.contactEmail && (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">Email Contact</div>
                            <a 
                              href={`mailto:${selectedChallenge.contactEmail}`}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {selectedChallenge.contactEmail}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedChallenge.contactForm && (
                        <div className="flex items-center space-x-3 mt-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">Submission Form</div>
                            <a 
                              href={selectedChallenge.contactForm}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline flex items-center"
                            >
                              Fill out the form
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedChallenge.tags && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedChallenge.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesFixed;
