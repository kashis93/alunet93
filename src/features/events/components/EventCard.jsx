import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Bookmark, 
  ExternalLink,
  Video,
  Map,
  User,
  CheckCircle,
  Link2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui';
import { sendConnectionRequest } from '@/services/socialService';

const EventCard = ({ event, onShare, onSave, onViewDetails }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(event.savedBy?.includes(user?.uid));
  const isOnline = event.mode === 'online';
  const isOffline = event.mode === 'offline';

  const toJSDate = (v) => {
    try {
      if (!v) return new Date();
      if (typeof v.toDate === 'function') {
        const d = v.toDate();
        return isNaN(d.getTime()) ? new Date() : d;
      }
      const d = v instanceof Date ? v : new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href + `/event/${event.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/event/${event.id}`);
    }
    onShare?.(event.id);
  };

  const handleSave = async () => {
    try {
      await onSave(event.id, !isSaved);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const start = toJSDate(event.startDate);
  const now = new Date();
  const isUpcoming = start > now;
  const isPast = start < now;

  const getEventStatusColor = () => {
    if (isPast) return 'bg-gray-100 text-gray-600';
    if (isUpcoming) return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getEventStatusText = () => {
    if (isPast) return 'Past Event';
    if (isUpcoming) return 'Upcoming';
    return 'Ongoing';
  };

  const getModeIcon = () => {
    if (isOnline) return <Video className="w-4 h-4" />;
    if (isOffline) return <MapPin className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getModeColor = () => {
    if (isOnline) return 'bg-purple-100 text-purple-700';
    if (isOffline) return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Event Header Image */}
      {event.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventStatusColor()}`}>
              {getEventStatusText()}
            </span>
          </div>

          {/* Mode Badge */}
          <div className="absolute top-4 right-4">
            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getModeColor()}`}>
              {getModeIcon()}
              <span className="capitalize">{event.mode}</span>
            </span>
          </div>

          {/* Date Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{format(start, 'd')}</div>
              <div className="text-xs text-gray-600 uppercase">{format(start, 'MMM')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Event Content */}
      <div className="p-5">
        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
            {event.title}
          </h3>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSave}
              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-yellow-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{format(start, 'EEEE, MMMM d, yyyy')} at {format(start, 'h:mm a')}</span>
          </div>

          {/* Location/Meeting Link */}
          {isOnline ? (
            <div className="flex items-center text-sm text-gray-600">
              <Video className="w-4 h-4 mr-2 text-gray-400" />
              <span className="flex-1">Online Event</span>
              {event.meetingLink && (
                <button
                  onClick={() => window.open(event.meetingLink, '_blank')}
                  className="ml-auto text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>Join Meeting</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="flex-1">{event.location}</span>
            </div>
          )}

          {/* Headline for online events */}
          {isOnline && event.headline && (
            <div className="flex items-start text-sm text-gray-600">
              <Link2 className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
              <span className="flex-1 italic">{event.headline}</span>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>By {event.organizer}</span>
            </div>
          )}
          {/* Contact */}
          {event.organizerEmail && (
            <div className="flex items-center text-sm text-gray-600">
              <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
              <a href={`mailto:${event.organizerEmail}`} className="text-blue-600 hover:underline">
                {event.organizerEmail}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onViewDetails?.(event)} className="rounded-lg">
            View Details
          </Button>
          {event.registrationLink ? (
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => window.open(event.registrationLink, '_blank', 'noopener,noreferrer')}
            >
              Register Now
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={handleShare}
            >
              Share
            </Button>
          )}
        </div>
        <div className="mt-3">
          {event.organizerId && user?.uid !== event.organizerId && (
            <Button
              variant="outline"
              className="w-full rounded-lg"
              onClick={async () => {
                try {
                  await sendConnectionRequest(user, event.organizerId);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Connect with Organizer
            </Button>
          )}
        </div>

        {/* Progress Bar for Capacity */}
        {event.maxAttendees && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Capacity</span>
              <span>{Math.round(((event.attendees?.length || 0) / event.maxAttendees) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(((event.attendees?.length || 0) / event.maxAttendees) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
