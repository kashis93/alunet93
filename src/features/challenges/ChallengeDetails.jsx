import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import {
  Calendar,
  DollarSign,
  Briefcase,
  Award,
  Users,
  ExternalLink,
  Mail,
  ArrowLeft,
  MessageCircle,
  Send,
  Building,
  GraduationCap
} from 'lucide-react';
import { db } from '@/services/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendConnectionRequest } from '@/services/socialService';

const ChallengeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  useEffect(() => {
    if (challenge) {
      const commentsRef = collection(db, 'challenges', id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
      });

      return () => unsubscribe();
    }
  }, [challenge, id]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      const challengeRef = doc(db, 'challenges', id);
      const challengeDoc = await getDoc(challengeRef);

      if (challengeDoc.exists()) {
        setChallenge({
          id: challengeDoc.id,
          ...challengeDoc.data()
        });
      } else {
        toast.error('Challenge not found');
        navigate('/challenges');
      }
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      toast.error('Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (challenge) => {
    if (!user) {
      toast.error('Please login to send connection request');
      return;
    }

    if (!challenge.postedBy) {
      toast.error('Unable to send connection request - user not found');
      return;
    }

    if (user.uid === challenge.postedBy) {
      toast.error('You cannot connect with yourself');
      return;
    }

    try {
      setLoading(true);
      await sendConnectionRequest(user, challenge.postedBy);
      toast.success(`Connection request sent to ${challenge.postedByName}!`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      if (error.message === 'Request already pending') {
        toast.error('Connection request already pending');
      } else if (error.message === 'Already connected') {
        toast.error('You are already connected with this user');
      } else {
        toast.error('Failed to send connection request');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = () => {
    if (challenge.registrationLink) {
      window.open(challenge.registrationLink, '_blank');
    } else if (challenge.contactEmail) {
      window.open(`mailto:${challenge.contactEmail}`, '_blank');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const commentsRef = collection(db, 'challenges', id, 'comments');
      await addDoc(commentsRef, {
        text: newComment,
        userId: user.uid,
        userName: user.displayName || user.name,
        userPhoto: user.photoURL,
        createdAt: new Date(),
        isReply: false,
        parentId: null
      });

      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Challenge not found</h2>
          <Button onClick={() => navigate('/challenges')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/challenges')}
        className="mb-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Challenges
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-slate-200/80 shadow-lg rounded-xl bg-white mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-green-500 text-white">Active</Badge>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {challenge.domain || 'General'}
                  </span>
                </div>

                <CardTitle className="text-2xl font-bold text-slate-900 mb-4">
                  {challenge.title}
                </CardTitle>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-16 w-16 border-3 border-white shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={() => challenge.postedBy && navigate(`/profile/${challenge.postedBy}`)}>
                      <AvatarImage src={challenge.postedByPhoto} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                        {challenge.postedByName?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-xl text-slate-900 mb-1">
                            {challenge.postedByName}
                          </div>
                          <div className="text-slate-600 flex items-center gap-3 text-sm">
                            {challenge.companyName && (
                              <span className="flex items-center gap-1.5">
                                <Building className="h-4 w-4" />
                                {challenge.companyName}
                              </span>
                            )}
                            {challenge.batchYear && (
                              <span className="flex items-center gap-1.5">
                                <GraduationCap className="h-4 w-4" />
                                Batch {challenge.batchYear}
                              </span>
                            )}
                          </div>
                        </div>
                        {user && user.uid !== challenge.postedBy && (
                          <Button
                            onClick={() => handleConnect(challenge)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>

                      {challenge.linkedInProfile && (
                        <a
                          href={challenge.linkedInProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2 mt-2 inline-flex font-medium"
                        >
                          <Building className="h-4 w-4" />
                          View LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {challenge.description && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg border-b border-slate-100 pb-2">Challenge Overview</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-md">
                  {challenge.description}
                </p>
                <div className="h-4" />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Problem Statement</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {challenge.problemStatement}
              </p>
            </div>

            {challenge.skillsRequired && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Skills Required</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {challenge.skillsRequired}
                </p>
              </div>
            )}

            {challenge.expectedDeliverables && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Expected Deliverables</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {challenge.expectedDeliverables}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Reward Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenge.cashReward && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-slate-900">Cash Reward</div>
                      <div className="text-slate-600">{challenge.cashReward}</div>
                    </div>
                  </div>
                )}
                {challenge.internshipReward && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-slate-900">Internship</div>
                      <div className="text-slate-600">Opportunity available</div>
                    </div>
                  </div>
                )}
                {challenge.certificateReward && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-slate-900">Certificate</div>
                      <div className="text-slate-600">Certificate of completion</div>
                    </div>
                  </div>
                )}
                {challenge.mentorshipReward && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600" />
                    <div>
                      <div className="font-medium text-slate-900">Mentorship</div>
                      <div className="text-slate-600">1-on-1 guidance</div>
                    </div>
                  </div>
                )}
                {challenge.otherRewards && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Award className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Other Benefits</div>
                      <div className="text-slate-600">{challenge.otherRewards}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Deadline</h3>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="h-5 w-5" />
                <span>{new Date(challenge.deadline).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Application Method</h3>
              <div className="space-y-4">
                {challenge.registrationLink && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">External Registration Link</span>
                      </div>
                      <Button
                        onClick={handleApplyNow}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                    <div className="text-sm text-green-700 bg-white rounded p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Application Link:</span>
                      </div>
                      <a
                        href={challenge.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 break-all"
                      >
                        {challenge.registrationLink}
                      </a>
                    </div>
                  </div>
                )}

                {challenge.contactEmail && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Email Application</span>
                      </div>
                      <Button
                        onClick={() => window.open(`mailto:${challenge.contactEmail}`, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                    <div className="text-sm text-blue-700 bg-white rounded p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Contact Email:</span>
                      </div>
                      <a
                        href={`mailto:${challenge.contactEmail}`}
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {challenge.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">Important Disclaimer</h4>
              <p className="text-amber-800 text-sm">
                AluVerse only provides the platform for listing challenges. Applications, rewards, and all communication are handled directly by the alumni who posted this challenge. Please verify all details before applying.
              </p>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
};

export default ChallengeDetails;
