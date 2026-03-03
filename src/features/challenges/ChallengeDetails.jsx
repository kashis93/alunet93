import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Textarea, Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { Calendar, Clock, Users, Trophy, MessageCircle, Upload, ArrowLeft, Send, Award, BookOpen, Target, Star, TrendingUp, User, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const ChallengeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Extended dummy data with all required fields
  const challengesData = {
    "1": {
      id: "1",
      title: "Data Analytics Challenge",
      bannerImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
      organizer: "Priya Sharma",
      organizerRole: "Senior Data Scientist @ Google",
      organizerAvatar: "https://i.pravatar.cc/150?img=1",
      deadline: "2026-03-30T23:59:59",
      participants: 127,
      category: "Data Science",
      difficulty: "Intermediate",
      description: "Analyze real-world datasets to derive actionable business insights. This challenge focuses on practical data analysis skills that are highly valued in the industry. Participants will work with large-scale datasets and apply advanced analytical techniques.",
      problemStatement: "Given a dataset of e-commerce transactions from a major online retailer, you are tasked with: 1) Identifying patterns in customer purchasing behavior, 2) Building a predictive model to identify customers at risk of churn, 3) Providing actionable recommendations to improve customer retention, 4) Creating visualizations that effectively communicate your findings to stakeholders. Your analysis should include comprehensive data cleaning, exploratory data analysis, statistical modeling, and business impact assessment.",
      rules: [
        "Teams of 1-3 members are allowed",
        "Use any programming language or analytical tools",
        "Submit a Jupyter notebook with complete code and explanations",
        "Include a 5-minute video presentation of your key findings",
        "All submissions must be original work",
        "Plagiarism will result in immediate disqualification",
        "External datasets can be used but must be properly cited",
        "Submissions must be made before the deadline"
      ],
      guidelines: [
        "Focus on business impact and actionable insights",
        "Clearly explain your methodology and assumptions",
        "Use appropriate visualizations to support your findings",
        "Consider ethical implications of your analysis",
        "Document your code thoroughly with comments",
        "Include limitations and potential improvements",
        "Provide both technical and business perspectives"
      ],
      rewards: [
        { rank: "1st Prize", description: "₹50,000 + Google Swag + Mentorship opportunity with Google's data science team", icon: "🏆" },
        { rank: "2nd Prize", description: "₹30,000 + Google Cloud Platform credits + Certificate", icon: "🥈" },
        { rank: "3rd Prize", description: "₹15,000 + Google Merchandise + LinkedIn recommendation", icon: "🥉" },
        { rank: "Top 10", description: "Certificate of Excellence + Google Cloud credits + Interview opportunity", icon: "🌟" },
        { rank: "All Participants", description: "Certificate of Participation + Access to exclusive webinars", icon: "🎯" }
      ],
      skills: ["Python", "Data Analysis", "Machine Learning", "Visualization", "Statistics", "SQL", "Business Analytics"],
      tags: ["Data Science", "Analytics", "ML", "Business Intelligence", "E-commerce"],
      submissionType: "file",
      maxFileSize: "50MB",
      allowedFileTypes: ".ipynb, .py, .csv, .pdf, .pptx",
      externalLink: "https://forms.gle/data-analytics-challenge"
    },
    "2": {
      id: "2",
      title: "Campus Smart Solutions Hackathon",
      bannerImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200",
      organizer: "Rahul Verma",
      organizerRole: "Product Manager @ Microsoft",
      organizerAvatar: "https://i.pravatar.cc/150?img=3",
      deadline: "2026-04-15T23:59:59",
      participants: 89,
      category: "IoT / Web Development",
      difficulty: "Beginner",
      description: "Build innovative solutions to make campus life smarter and more connected using modern web technologies and IoT integration. This 48-hour hackathon challenges students to solve real campus problems.",
      problemStatement: "Design and develop a comprehensive campus management system that integrates IoT sensors for smart parking, room booking, attendance tracking, and facility management. The solution should include: 1) A responsive web dashboard for students and faculty, 2) Real-time IoT data integration, 3) Mobile-friendly interface, 4) Analytics and reporting features, 5) Notification system for important updates. Focus on creating a seamless user experience that addresses daily campus challenges.",
      rules: [
        "Individual participation only",
        "Use modern web frameworks (React, Vue, or Angular)",
        "Include working demo with simulated IoT data",
        "Submit complete source code and deployment instructions",
        "48-hour hackathon format",
        "No use of copyrighted material without permission",
        "All code must be pushed to a public GitHub repository",
        "Live demo presentation required"
      ],
      guidelines: [
        "Focus on user experience and accessibility",
        "Implement real-time updates where applicable",
        "Consider scalability and security aspects",
        "Provide clear documentation and README",
        "Include API documentation for IoT integration",
        "Design with mobile-first approach",
        "Consider offline functionality for critical features"
      ],
      rewards: [
        { rank: "1st Prize", description: "₹75,000 + Microsoft Internship opportunity + Surface Laptop", icon: "🏆" },
        { rank: "2nd Prize", description: "₹40,000 + Microsoft Azure credits worth $1000", icon: "🥈" },
        { rank: "3rd Prize", description: "₹20,000 + Microsoft merchandise + Tech conference pass", icon: "🥉" },
        { rank: "Top 5", description: "Microsoft certification voucher + Mentorship program", icon: "🌟" }
      ],
      skills: ["Web Development", "IoT", "React", "Node.js", "Database Design", "API Development", "UI/UX"],
      tags: ["Hackathon", "IoT", "Web Dev", "Campus", "Smart Solutions"],
      submissionType: "file",
      maxFileSize: "100MB",
      allowedFileTypes: ".zip, .tar.gz, .pdf",
      externalLink: "https://forms.gle/campus-hackathon"
    },
    "3": {
      id: "3",
      title: "UI/UX Design Sprint",
      bannerImage: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1200",
      organizer: "Ananya Gupta",
      organizerRole: "UX Designer @ Amazon",
      organizerAvatar: "https://i.pravatar.cc/150?img=5",
      deadline: "2026-03-20T23:59:59",
      participants: 64,
      category: "Design",
      difficulty: "Intermediate",
      description: "Redesign the university mobile app for better student experience. This design sprint focuses on creating intuitive, accessible, and engaging mobile interfaces.",
      problemStatement: "The current university mobile app suffers from poor user engagement and confusing navigation. Your task is to completely redesign the app focusing on: 1) Improved information architecture, 2) Enhanced user onboarding, 3) Better accessibility features, 4) Gamification elements to increase engagement, 5) Personalized dashboard for students, 6) Streamlined communication features. Submit high-fidelity prototypes, design system documentation, and user research findings.",
      rules: [
        "Individual or team participation (max 2 members)",
        "Use modern design tools (Figma, Adobe XD, Sketch)",
        "Submit interactive prototypes with all screens",
        "Include design rationale and user research",
        "Follow WCAG 2.1 accessibility guidelines",
        "Original designs only - no template usage",
        "Include both iOS and Android designs",
        "Submit design system documentation"
      ],
      guidelines: [
        "Conduct user research with actual students",
        "Create detailed user personas and journey maps",
        "Focus on mobile-first design principles",
        "Ensure consistency across all screens",
        "Include micro-interactions and animations",
        "Consider offline functionality",
        "Test designs with accessibility tools"
      ],
      rewards: [
        { rank: "1st Prize", description: "₹35,000 + Amazon Design internship + Kindle Oasis", icon: "🏆" },
        { rank: "2nd Prize", description: "₹20,000 + Adobe Creative Cloud subscription", icon: "🥈" },
        { rank: "3rd Prize", description: "₹10,000 + Design tools and resources", icon: "🥉" },
        { rank: "Top 10", description: "Portfolio review by Amazon designers + Certificate", icon: "🌟" }
      ],
      skills: ["UI Design", "UX Research", "Prototyping", "Figma", "User Testing", "Design Systems", "Mobile Design"],
      tags: ["UI/UX", "Design Sprint", "Mobile App", "User Research", "Prototyping"],
      submissionType: "file",
      maxFileSize: "200MB",
      allowedFileTypes: ".fig, .xd, .sketch, .pdf, .mp4",
      externalLink: "https://forms.gle/uiux-sprint"
    }
  };

  const sampleComments = [
    {
      id: 1,
      author: "Ankit Kumar",
      authorRole: "3rd Year CSE",
      avatar: "https://i.pravatar.cc/150?img=5",
      content: "This looks exciting! Can we use pre-trained models for the analysis?",
      timestamp: "2026-02-28T10:30:00",
      likes: 12
    },
    {
      id: 2,
      author: "Priya Sharma",
      authorRole: "Senior Data Scientist @ Google",
      avatar: "https://i.pravatar.cc/150?img=1",
      content: "Yes, you can use pre-trained models as long as you properly credit them and explain your modifications.",
      timestamp: "2026-02-28T11:15:00",
      likes: 28,
      isOrganizer: true
    }
  ];

  useEffect(() => {
    // Simulate loading challenge data
    setTimeout(() => {
      const challengeData = challengesData[id];
      if (challengeData) {
        setChallenge(challengeData);
        setComments(sampleComments);
      } else {
        toast.error("Challenge not found");
        navigate("/challenges");
      }
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  useEffect(() => {
    if (!challenge?.deadline) return;

    const calculateTimeLeft = () => {
      const difference = new Date(challenge.deadline) - new Date();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [challenge?.deadline]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: "Current User",
      authorRole: "Student",
      avatar: "https://i.pravatar.cc/150?img=8",
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Comment posted successfully!");
  };

  const handleFileUpload = () => {
    toast.success("File upload functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Banner Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-64 md:h-96 overflow-hidden"
      >
        <img
          src={challenge.bannerImage}
          alt={challenge.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <Button
          variant="ghost"
          onClick={() => navigate("/challenges")}
          className="absolute top-4 left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Button>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-bold mb-2"
          >
            {challenge.title}
          </motion.h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
              {challenge.category}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
              {challenge.difficulty}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Organizer Info */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={challenge.organizerAvatar} />
                  <AvatarFallback>{challenge.organizer[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{challenge.organizer}</h3>
                  <p className="text-muted-foreground">{challenge.organizerRole}</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
            </motion.div>

            {/* Problem Statement */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Problem Statement
              </h2>
              <p className="text-gray-700 leading-relaxed">{challenge.problemStatement}</p>
            </motion.div>

            {/* Rules & Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Rules
                </h3>
                <ul className="space-y-2">
                  {challenge.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span className="text-gray-700 text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Guidelines
                </h3>
                <ul className="space-y-2">
                  {challenge.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span className="text-gray-700 text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Rewards */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-primary/10 to-blue-100 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Rewards & Prizes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenge.rewards.map((reward, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <h4 className="font-semibold text-primary">{reward.rank}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Discussion ({comments.length})
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts or ask questions..."
                      className="resize-none"
                      rows={3}
                    />
                    <Button type="submit" className="mt-2" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{comment.author}</span>
                        {comment.isOrganizer && (
                          <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                            Organizer
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{comment.authorRole}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                        <button className="flex items-center gap-1 hover:text-primary">
                          <TrendingUp className="h-4 w-4" />
                          {comment.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {/* Deadline & Participants */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="space-y-4">
                {/* Countdown Timer */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    Deadline
                  </h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-red-600">{timeLeft.days}</div>
                      <div className="text-xs text-gray-600">Days</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-red-600">{timeLeft.hours}</div>
                      <div className="text-xs text-gray-600">Hours</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-red-600">{timeLeft.minutes}</div>
                      <div className="text-xs text-gray-600">Minutes</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-red-600">{timeLeft.seconds}</div>
                      <div className="text-xs text-gray-600">Seconds</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {new Date(challenge.deadline).toLocaleDateString()}
                  </p>
                </div>

                {/* Participants */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Participants</span>
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{challenge.participants}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {challenge.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submission */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 shadow-lg text-white"
            >
              <h3 className="text-xl font-bold mb-4">Submit Your Solution</h3>
              <div className="space-y-3 mb-4">
                <p className="text-sm opacity-90">
                  Max file size: {challenge.maxFileSize}
                </p>
                {challenge.allowedFileTypes && (
                  <p className="text-sm opacity-90">
                    Allowed files: {challenge.allowedFileTypes}
                  </p>
                )}
              </div>
              <Button
                onClick={handleFileUpload}
                className="w-full bg-white text-primary hover:bg-gray-100 font-semibold"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Submission
              </Button>
            </motion.div>

            {/* External Link */}
            {challenge.externalLink && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <Button
                  onClick={() => window.open(challenge.externalLink, "_blank")}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Registration Form
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetails;
