
import { useState, useEffect } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Label, Input, Textarea } from "@/components/ui";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Globe, Building2, Plus, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import eventsData from "@/data/eventsData.json";
import { addData } from "@/services/dataService";
import { sendConnectionRequest } from "@/services/socialService";
import { db } from "@/services/firebase";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const Events = () => {
  const { user, requireAuth } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [posterDetails, setPosterDetails] = useState({});
  const [failedImages, setFailedImages] = useState(new Set());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    eventType: "offline",
    location: "",
    meetingLink: "",
    registrationLink: "",
    contactInfo: ""
  });

  const handleImageError = (eventId) => {
    setFailedImages(prev => new Set([...prev, eventId]));
  };

  const getEventImage = (event) => {
    if (failedImages.has(event.id)) {
      return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600";
    }
    return event.image;
  };

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventsList([...data, ...eventsData]);

      // Fetch poster details for each event
      data.forEach(async (event) => {
        if (event.userId && event.userId !== user?.uid) {
          const userDoc = await getDoc(doc(db, "users", event.userId));
          if (userDoc.exists()) {
            setPosterDetails(prev => ({
              ...prev,
              [event.userId]: userDoc.data()
            }));
          }
        }
      });
    }, (error) => {
      console.error("Firestore error:", error);
      setEventsList(eventsData);
    });
    return () => unsubscribe();
  }, [user?.uid]);

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

  const handlePost = () => {
    if (!requireAuth("post")) return;
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const result = await addData("events", {
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
        date: "",
        time: "",
        eventType: "offline",
        location: "",
        meetingLink: "",
        registrationLink: "",
        contactInfo: ""
      });
      toast.success("Event posted successfully!");
    } else {
      toast.error("Failed to post: " + result.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Campus Events</h1>
          <p className="text-muted-foreground mt-1">Discover exciting events, workshops, and activities happening at LDCE.</p>
        </div>
        {(user?.role === "alumni" || user?.role === "student") && (
          <Button onClick={handlePost} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Post Event
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Post an Event</DialogTitle>
            <DialogDescription>
              Organize an event. Provide location for offline events or meeting link for online events.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. AI & ML Workshop" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What is this event about?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <select
                id="eventType"
                className="w-full h-10 px-3 border rounded-md text-sm"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="offline">Offline Event</option>
                <option value="online">Online Event</option>
              </select>
            </div>
            {formData.eventType === "offline" ? (
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. LDCE Auditorium, Room 301" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link *</Label>
                <Input id="meetingLink" type="url" required value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://zoom.us/j/... or https://meet.google.com/..." />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="registrationLink">Registration Link (Optional)</Label>
              <Input id="registrationLink" type="url" value={formData.registrationLink} onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })} placeholder="https://forms.google.com/... (if you have a registration form)" />
              <p className="text-xs text-muted-foreground">Leave empty if no registration required</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Input id="contactInfo" required value={formData.contactInfo} onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })} placeholder="email@example.com or phone number" />
              <p className="text-xs text-muted-foreground">For attendees to contact you directly</p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full gradient-primary">
                {loading ? "Posting..." : "Post Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {eventsList.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all group flex flex-col"
          >
            <div className="h-56 overflow-hidden relative bg-slate-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-white/50" />
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md bg-blue-500/90 text-white">
                  {event.eventType === 'online' ? 'Online Event' : 'Offline Event'}
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h2 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">{event.title}</h2>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed flex-grow">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Date & Time</p>
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {event.date} at {event.time}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    {event.eventType === 'online' ? 'Meeting Link' : 'Location'}
                  </p>
                  {event.eventType === 'online' ? (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline break-all"
                    >
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      {event.meetingLink || 'Link not provided'}
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {event.location || 'Location not provided'}
                    </span>
                  )}
                </div>
              </div>

              {event.postedBy && (
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-black tracking-tighter">Posted By</span>
                    <span className="text-xs font-extrabold text-slate-800">{event.postedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.userId && event.userId !== user?.uid && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleConnect(event.userId, posterDetails[event.userId]?.name || event.postedBy)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" /> Connect
                      </Button>
                    )}
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground font-normal">Contact:</div>
                      <div className="text-xs font-bold text-primary">{event.contactInfo}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                {event.eventType === 'online' && event.meetingLink && (
                  <Button
                    className="w-full rounded-xl h-11 text-sm"
                    onClick={() => window.open(event.meetingLink, "_blank", "noopener,noreferrer")}
                  >
                    Join Meeting
                  </Button>
                )}
                {event.registrationLink && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-11 text-sm"
                    onClick={() => window.open(event.registrationLink, "_blank", "noopener,noreferrer")}
                  >
                    Register for Event
                  </Button>
                )}
                {!event.registrationLink && !event.meetingLink && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    Contact organizer for details
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Events;
