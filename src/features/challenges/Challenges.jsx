import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Label, Input, Textarea } from "@/components/ui";
import { motion } from "framer-motion";
import { challenges as dummyChallenges } from "@/data/dummyData.js";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Trophy, CalendarCheck, Users, Plus, UserPlus } from "lucide-react";
import { addData } from "@/services/dataService";
import { sendConnectionRequest } from "@/services/socialService";
import { db } from "@/services/firebase";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const Challenges = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challengesList, setChallengesList] = useState([]);
  const [posterDetails, setPosterDetails] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    deadline: "",
    externalLink: "",
    contactInfo: ""
  });

  useEffect(() => {
    const q = query(collection(db, "challenges"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChallengesList([...data, ...dummyChallenges]);

      // Fetch poster details for each challenge
      data.forEach(async (challenge) => {
        if (challenge.userId && challenge.userId !== user?.uid) {
          const userDoc = await getDoc(doc(db, "users", challenge.userId));
          if (userDoc.exists()) {
            setPosterDetails(prev => ({
              ...prev,
              [challenge.userId]: userDoc.data()
            }));
          }
        }
      });
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handlePost = () => {
    if (!requireAuth("post")) return;
    setIsDialogOpen(true);
  };

  const handleConnect = async (posterUserId, posterName) => {
    if (!user) {
      toast.error("Please login to send connection requests");
      return;
    }

    if (posterUserId === user.uid) {
      toast.error("You cannot connect with yourself");
      return;
    }

    try {
      await sendConnectionRequest(user, posterUserId);
      toast.success(`Connection request sent to ${posterName}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const result = await addData("challenges", {
      ...formData,
      postedBy: user.displayName || user.name,
      userId: user.uid,
      timestamp: new Date()
    });
    setLoading(false);

    if (result.success) {
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        deadline: "",
        externalLink: "",
        contactInfo: ""
      });
      toast.success("Challenge posted successfully!");
    } else {
      toast.error("Failed to post: " + result.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Challenges</h1>
          <p className="text-muted-foreground mt-1">Compete, learn, and win exciting prizes</p>
        </div>
        {user?.role === "alumni" && (
          <Button onClick={handlePost} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Post Challenge
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challengesList.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-border flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/challenges/${c.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-blue-100 text-blue-700">
                  {c.category || 'General'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{c.title}</h2>
              <p className="text-muted-foreground text-sm flex-grow leading-relaxed">{c.description}</p>

              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5"><CalendarCheck className="h-3.5 w-3.5" /> Deadline: {c.deadline}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="text-muted-foreground font-normal">Posted by:</span> {c.postedBy}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-normal">Contact:</span>
                  <span className="text-primary font-medium">{c.contactInfo}</span>
                </div>
                {c.userId && c.userId !== user?.uid && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {posterDetails[c.userId]?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {posterDetails[c.userId]?.name || c.postedBy}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation to details page
                        handleConnect(c.userId, posterDetails[c.userId]?.name || c.postedBy);
                      }}
                    >
                      <UserPlus className="h-3 w-3 mr-1" /> Connect
                    </Button>
                  </div>
                )}
              </div>

              <Button
                className="mt-6 w-full rounded-xl gradient-primary text-primary-foreground font-bold h-11"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation to details page
                  if (c.externalLink) {
                    window.open(c.externalLink, "_blank", "noopener,noreferrer");
                  } else {
                    toast.error("No external link provided");
                  }
                }}
              >
                Apply via External Link
              </Button>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Opens external registration form
              </p>
            </motion.div>
          ))}
      </div>

      {/* Post Challenge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Post a Challenge</DialogTitle>
            <DialogDescription>
              Post a challenge you&apos;re facing. Students will apply through your external link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Data Analytics Challenge" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe challenge rules and goals..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. AI / Web Development / Design" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" required value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalLink">External Registration Link *</Label>
              <Input id="externalLink" type="url" required value={formData.externalLink} onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })} placeholder="https://forms.google.com/..." />
              <p className="text-xs text-muted-foreground">Students will apply directly through this link</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Input id="contactInfo" required value={formData.contactInfo} onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })} placeholder="email@example.com or phone number" />
              <p className="text-xs text-muted-foreground">For students to contact you directly</p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full gradient-primary">
                {loading ? "Posting..." : "Post Challenge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Challenges;
