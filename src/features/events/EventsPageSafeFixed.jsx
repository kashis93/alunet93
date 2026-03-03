import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Video,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CreateEventFixed from './components/CreateEventFixed';
import EventCard from './components/EventCard';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

const EventsPageSafeFixed = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Load real events from Firebase
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      orderBy("startDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = [];
      snapshot.forEach((doc) => {
        const eventData = doc.data();
        eventsData.push({
          id: doc.id,
          ...eventData,
          startDate: eventData.startDate?.toDate?.() || new Date(eventData.startDate) || new Date(),
          endDate: eventData.endDate?.toDate?.() || new Date(eventData.endDate) || new Date()
        });
      });
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEventCreate = async (eventData) => {
    try {
      const eventsRef = collection(db, "events");
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
        attendees: [],
        savedBy: []
      });
      console.log("Event created with ID:", docRef.id);
      toast.success("Event created successfully!");
      setShowCreateEvent(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
              <p className="text-gray-600">Discover and join events from the alumni community</p>
            </div>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'offline', 'online'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter === 'all' ? 'All Events' : filter === 'offline' ? 'Offline' : 'Online'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Display */}
        <div>
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create an event!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={(event) => console.log('View details:', event)}
                  onShare={(eventId) => console.log('Share event:', eventId)}
                  onSave={(eventId, isSaved) => console.log('Save event:', eventId, isSaved)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Event Modal */}
        {showCreateEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <CreateEventFixed
              onEventCreate={handleEventCreate}
              onClose={() => setShowCreateEvent(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPageSafeFixed;
