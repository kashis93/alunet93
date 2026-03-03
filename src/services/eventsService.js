import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  increment 
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Firestore Collections Structure:
// events/{eventId}
// ├── title: string
// ├── description: string
// ├── startDate: timestamp
// ├── endDate: timestamp
// ├── mode: string (online/offline/hybrid)
// ├── location: string
// ├── meetingLink: string
// ├── maxAttendees: number
// ├── organizer: string
// ├── organizerEmail: string
// ├── organizerId: string
// ├── coverImage: string
// ├── imagePublicId: string
// ├── tags: array of strings
// ├── attendees: array of userIds
// ├── savedBy: array of userIds
// ├── createdAt: timestamp
// ├── updatedAt: timestamp

class EventsService {
  // Create a new event
  static async createEvent(eventData) {
    try {
      const eventWithTimestamp = {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attendees: [],
        savedBy: []
      };

      const docRef = await addDoc(collection(db, 'events'), eventWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Get events with real-time updates
  static getEventsRealtime(callback, options = {}) {
    const {
      limit: limitCount = 50,
      organizerId,
      mode,
      orderByField = 'startDate',
      orderDirection = 'asc'
    } = options;

    let q = query(
      collection(db, 'events'),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    // Add filters if provided
    if (organizerId) {
      q = query(q, where('organizerId', '==', organizerId));
    }
    if (mode) {
      q = query(q, where('mode', '==', mode));
    }

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Error fetching events:', error);
      callback([]);
    });
  }

  // Get single event
  static async getEvent(eventId) {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  // Update event
  static async updateEvent(eventId, updateData) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete event
  static async deleteEvent(eventId) {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // RSVP to event
  static async toggleRSVP(eventId, userId) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const attendees = eventDoc.data().attendees || [];
      const isAttending = attendees.includes(userId);

      // Check capacity
      const maxAttendees = eventDoc.data().maxAttendees;
      if (!isAttending && maxAttendees && attendees.length >= maxAttendees) {
        throw new Error('Event is full');
      }

      if (isAttending) {
        await updateDoc(eventRef, {
          attendees: arrayRemove(userId)
        });
      } else {
        await updateDoc(eventRef, {
          attendees: arrayUnion(userId)
        });
      }

      return !isAttending; // Return new attendance status
    } catch (error) {
      console.error('Error toggling RSVP:', error);
      throw error;
    }
  }

  // Save/Unsave event
  static async toggleSaveEvent(eventId, userId) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const savedBy = eventDoc.data().savedBy || [];
      const isSaved = savedBy.includes(userId);

      if (isSaved) {
        await updateDoc(eventRef, {
          savedBy: arrayRemove(userId)
        });
      } else {
        await updateDoc(eventRef, {
          savedBy: arrayUnion(userId)
        });
      }

      return !isSaved; // Return new save status
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  }

  // Get events by user
  static getUserEvents(userId, callback) {
    const q = query(
      collection(db, 'events'),
      where('organizerId', '==', userId),
      orderBy('startDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Error fetching user events:', error);
      callback([]);
    });
  }

  // Get events user is attending
  static getAttendingEvents(userId, callback) {
    const q = query(
      collection(db, 'events'),
      where('attendees', 'array-contains', userId),
      orderBy('startDate', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Error fetching attending events:', error);
      callback([]);
    });
  }

  // Get saved events
  static getSavedEvents(userId, callback) {
    const q = query(
      collection(db, 'events'),
      where('savedBy', 'array-contains', userId),
      orderBy('startDate', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Error fetching saved events:', error);
      callback([]);
    });
  }

  // Search events
  static searchEvents(searchTerm, callback) {
    const q = query(
      collection(db, 'events'),
      orderBy('startDate', 'asc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      callback(events);
    }, (error) => {
      console.error('Error searching events:', error);
      callback([]);
    });
  }

  // Get upcoming events
  static getUpcomingEvents(callback, limitCount = 10) {
    const now = new Date();
    const q = query(
      collection(db, 'events'),
      where('startDate', '>=', now),
      orderBy('startDate', 'asc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Error fetching upcoming events:', error);
      callback([]);
    });
  }

  // Get events by date range
  static getEventsByDateRange(startDate, endDate, callback) {
    const q = query(
      collection(db, 'events'),
      where('startDate', '>=', startDate),
      where('startDate', '<=', endDate),
      orderBy('startDate', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error('Error fetching events by date range:', error);
      callback([]);
    });
  }

  // Calendar Integration Utilities
  static generateGoogleCalendarUrl(event) {
    const startDate = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.mode === 'online' ? event.meetingLink : event.location,
      dates: `${startDate}/${endDate}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static generateOutlookCalendarUrl(event) {
    const startDate = new Date(event.startDate).toISOString();
    const endDate = new Date(event.endDate).toISOString();
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      startdt: startDate,
      enddt: endDate,
      subject: event.title,
      body: event.description,
      location: event.mode === 'online' ? event.meetingLink : event.location
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  static generateYahooCalendarUrl(event) {
    const startDate = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const params = new URLSearchParams({
      v: 60,
      title: event.title,
      desc: event.description,
      st: startDate,
      et: endDate,
      in_loc: event.mode === 'online' ? event.meetingLink : event.location
    });

    return `https://calendar.yahoo.com/?${params.toString()}`;
  }

  static downloadIcsFile(event) {
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}00`;
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alumni Platform//Events//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@alumni-platform.com`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.mode === 'online' ? event.meetingLink : event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get event statistics
  static async getEventStats() {
    try {
      const now = new Date();
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const stats = {
        total: events.length,
        upcoming: events.filter(e => new Date(e.startDate) > now).length,
        past: events.filter(e => new Date(e.endDate) < now).length,
        online: events.filter(e => e.mode === 'online').length,
        offline: events.filter(e => e.mode === 'offline').length,
        hybrid: events.filter(e => e.mode === 'hybrid').length,
        totalAttendees: events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting event stats:', error);
      return {
        total: 0,
        upcoming: 0,
        past: 0,
        online: 0,
        offline: 0,
        hybrid: 0,
        totalAttendees: 0
      };
    }
  }
}

export default EventsService;
