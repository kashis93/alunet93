import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Users, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  TrendingUp,
  Clock
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import EventCard from './components/EventCard';
import CreateEvent from './components/CreateEvent';
import EventDetails from './components/EventDetails';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  // Fetch events from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      orderBy('startDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    const now = new Date();
    switch (activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(event => isAfter(new Date(event.startDate), now));
        break;
      case 'past':
        filtered = filtered.filter(event => isBefore(new Date(event.endDate), now));
        break;
      case 'today':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= startOfDay(now) && eventDate <= endOfDay(now);
        });
        break;
      case 'week':
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= now && eventDate <= weekFromNow;
        });
        break;
    }

    // Mode filter
    if (modeFilter !== 'all') {
      filtered = filtered.filter(event => event.mode === modeFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, activeFilter, modeFilter]);

  // Create new event
  const handleCreateEvent = async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  // RSVP to event
  const handleRSVP = async (eventId, isAttending) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      if (isAttending) {
        await updateDoc(eventRef, {
          attendees: arrayUnion(user.uid)
        });
      } else {
        await updateDoc(eventRef, {
          attendees: arrayRemove(user.uid)
        });
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      throw error;
    }
  };

  // Save event
  const handleSaveEvent = async (eventId, isSaved) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      if (isSaved) {
        await updateDoc(eventRef, {
          savedBy: arrayUnion(user.uid)
        });
      } else {
        await updateDoc(eventRef, {
          savedBy: arrayRemove(user.uid)
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  };

  // Share event
  const handleShareEvent = async (eventId) => {
    try {
      console.log('Event shared:', eventId);
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  // Get stats
  const upcomingEvents = filteredEvents.filter(event => isAfter(new Date(event.startDate), new Date()));
  const pastEvents = filteredEvents.filter(event => isBefore(new Date(event.endDate), new Date()));
  const onlineEvents = filteredEvents.filter(event => event.mode === 'online');
  const offlineEvents = filteredEvents.filter(event => event.mode === 'offline');

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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pastEvents.length}</p>
                  <p className="text-sm text-gray-600">Past Events</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{onlineEvents.length}</p>
                  <p className="text-sm text-gray-600">Online</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{offlineEvents.length}</p>
                  <p className="text-sm text-gray-600">Offline</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'past', label: 'Past' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Filters */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All Modes' },
                  { value: 'online', icon: Video },
                  { value: 'offline', icon: MapPin },
                  { value: 'hybrid', icon: Users }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setModeFilter(filter.value)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                      modeFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.icon && <filter.icon className="w-4 h-4" />}
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
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
                {searchTerm || activeFilter !== 'all' || modeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Be the first to create an event!'}
              </p>
              {!searchTerm && activeFilter === 'all' && modeFilter === 'all' && (
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Event
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={handleRSVP}
                  onShare={handleShareEvent}
                  onSave={handleSaveEvent}
                  onViewDetails={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateEvent
              onEventCreate={handleCreateEvent}
              onClose={() => setShowCreateEvent(false)}
            />
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRSVP={handleRSVP}
          onSave={handleSaveEvent}
          onShare={handleShareEvent}
        />
      )}
    </div>
  );
};

export default EventsPage;
