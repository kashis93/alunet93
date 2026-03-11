
import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { toast } from "sonner";
import EventsService from "@/services/eventsService";
import CreateEventFixed from "./components/CreateEventFixed";
import EventCard from "./components/EventCard";

const Events = () => {
  const { user, requireAuth } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    const unsub = EventsService.getEventsRealtime((events) => {
      setEventsList(events);
    }, { orderByField: 'startDate', orderDirection: 'asc', limit: 60 });
    return () => unsub && unsub();
  }, []);

  const handlePost = () => {
    if (!requireAuth("post")) return;
    setIsDialogOpen(true);
  };

  const handleCreate = async (eventData) => {
    try {
      await EventsService.createEvent({
        ...eventData
      });
      toast.success("Event posted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to post event");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <span className="text-xl font-bold text-primary">{eventsList.length}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 block">Upcoming Events</span>
            </div>
          </div>

          {(user?.role === "alumni" || user?.role === "student") && (
            <Button
              onClick={handlePost}
              className="h-11 px-8 gradient-primary text-primary-foreground gap-2 rounded-full font-semibold shadow-lg active:scale-95 transition-all"
            >
              <Plus className="h-5 w-5" /> Post Event
            </Button>
          )}
        </div>

        {isDialogOpen && (
          <CreateEventFixed
            onEventCreate={handleCreate}
            onClose={() => setIsDialogOpen(false)}
          />
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsList.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-gray-400 text-lg">No events found. Check back later!</p>
            </div>
          ) : (
            eventsList.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl overflow-hidden"
              >
                <EventCard
                  event={event}
                  onShare={() => { }}
                  onSave={() => { }}
                  onViewDetails={() => { }}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
