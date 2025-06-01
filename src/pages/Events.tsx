import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mockEvents } from '../data/mockData';
import { Calendar, MapPin, Users, Clock, Search, BookmarkPlus, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useUserData } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  virtual: boolean;
  type: string;
  host: string;
}

const Events = () => {
  const { user } = useAuth();
  const { registeredEvents, registerForEvent, unregisterFromEvent } = useUserData();
  const [selectedType, setSelectedType] = useState<string>('');
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [events, setEvents] = useState(mockEvents);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    virtual: false,
    type: 'workshop',
    host: ''
  });

  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());

  const eventTypes = useMemo(
    () => Array.from(new Set(mockEvents.map(event => event.type))).sort(),
    []
  );

  const filteredEvents = useMemo(
    () =>
      mockEvents.filter(event => {
        const matchesType = !selectedType || event.type === selectedType;
        const matchesVirtual = !showVirtualOnly || event.virtual;
        const matchesSearch =
          !searchQuery ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesVirtual && matchesSearch;
      }),
    [selectedType, showVirtualOnly, searchQuery]
  );

  const toggleSaveEvent = useCallback((eventId: string) => {
    const updated = new Set(savedEvents);
    if (updated.has(eventId)) {
      updated.delete(eventId);
    } else {
      updated.add(eventId);
    }
    setSavedEvents(updated);
    localStorage.setItem('savedEvents', JSON.stringify(Array.from(updated)));
  }, [savedEvents]);

  const toggleRegisterEvent = useCallback((eventId: string) => {
    if (registeredEvents.some(event => event.id === eventId)) {
      unregisterFromEvent(eventId);
    } else {
      registerForEvent(eventId);
    }
  }, [registeredEvents]);

  useEffect(() => {
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEvents(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEvent = {
        id: `event-${Date.now()}`,
        title: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date,
        startTime: eventFormData.startTime,
        endTime: eventFormData.endTime,
        location: eventFormData.location,
        virtual: eventFormData.virtual,
        type: eventFormData.type as 'workshop' | 'career_fair' | 'info_session' | 'networking' | 'other',
        host: eventFormData.host,
        time: `${eventFormData.startTime} - ${eventFormData.endTime}`,
        organizer: user?.name || 'Unknown Organizer',
      };
      setEvents((prev) => [...prev, newEvent]);
      setShowEventForm(false);
      setEventFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        virtual: false,
        type: 'other',
        host: '',
      });
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent === null) return;

    const updatedEvents = events.map(event =>
      event.id === editingEvent
        ? { ...event, ...eventFormData, type: eventFormData.type as 'workshop' | 'career_fair' | 'info_session' | 'networking' | 'other' }
        : event
    );
    setEvents(updatedEvents);
    setEditingEvent(null);
    setEventFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      virtual: false,
      type: 'workshop',
      host: ''
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const startEdit = (event: any) => {
    setEditingEvent(event.id);
    setEventFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      virtual: event.virtual,
      type: event.type,
      host: event.host
    });
    setShowEventForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="mt-2 text-gray-600">Browse and register for career events, workshops, and networking opportunities</p>
        </div>
        {(user?.role === 'employer' || user?.role === 'admin') && (
          <button
            onClick={() => setShowEventForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Event
          </button>
        )}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={editingEvent ? handleEditEvent : handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={eventFormData.type}
                    onChange={(e) => setEventFormData({...eventFormData, type: e.target.value})}
                    className="input w-full"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      value={eventFormData.startTime}
                      onChange={(e) => setEventFormData({...eventFormData, startTime: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      value={eventFormData.endTime}
                      onChange={(e) => setEventFormData({...eventFormData, endTime: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Host</label>
                  <input
                    type="text"
                    value={eventFormData.host}
                    onChange={(e) => setEventFormData({...eventFormData, host: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                    className="input w-full h-24"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={eventFormData.virtual}
                      onChange={(e) => setEventFormData({...eventFormData, virtual: e.target.checked})}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2">Virtual Event</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Save Changes' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="w-full md:w-64">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Events
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
              placeholder="Search by title or description"
              aria-label="Search events"
            />
            <Search size={16} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="w-full md:w-64">
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Event Type
          </label>
          <select
            id="eventType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input w-full"
            aria-label="Filter by event type"
          >
            <option value="">All Event Types</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Virtual Events Toggle */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showVirtualOnly}
              onChange={(e) => setShowVirtualOnly(e.target.checked)}
              className="form-checkbox h-4 w-4 text-primary-600 rounded"
              aria-label="Show virtual events only"
            />
            <span className="ml-2 text-gray-700">Virtual Events Only</span>
          </label>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow overflow-hidden">
              {/* Event Image */}
              {event.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Event Details */}
              <div className="p-6">
                {/* Event Type and Virtual Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`badge ${
                      event.type === 'workshop'
                        ? 'badge-primary'
                        : event.type === 'career_fair'
                        ? 'badge-secondary'
                        : event.type === 'info_session'
                        ? 'badge-accent'
                        : event.type === 'networking'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                    aria-label={`Event type: ${event.type}`}
                  >
                    {event.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  {event.virtual && (
                    <span className="badge badge-success" aria-label="Virtual event">Virtual</span>
                  )}
                </div>

                {/* Event Title and Description */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                {/* Event Metadata */}
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    {event.virtual ? 'Online Event' : event.location}
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    {event.attendees} attendees
                  </div>
                </div>

                {/* Event Actions */}
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Hosted by {event.host}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`text-gray-400 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        savedEvents.has(event.id) ? 'text-primary-600' : ''
                      }`}
                      onClick={() => toggleSaveEvent(event.id)}
                      aria-label={
                        savedEvents.has(event.id)
                          ? `Unsave ${event.title}`
                          : `Save ${event.title}`
                      }
                    >
                      <BookmarkPlus size={20} />
                    </button>
                    <button
                      className={`btn text-sm py-1.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        registeredEvents.some(e => e.id === event.id)
                          ? 'btn-outline text-primary-600'
                          : 'btn-primary'
                      }`}
                      onClick={() => toggleRegisterEvent(event.id)}
                      aria-label={
                        registeredEvents.some(e => e.id === event.id)
                          ? `Unregister from ${event.title}`
                          : `Register for ${event.title}`
                      }
                    >
                      {registeredEvents.some(e => e.id === event.id) ? 'Unregister' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Controls */}
              {user?.role === 'admin' && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => startEdit(event)}
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    aria-label="Edit event"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn btn-danger btn-sm flex items-center gap-1"
                    aria-label="Delete event"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}

              {/* Employer controls */}
              {user?.role === 'employer' && event.organizer === user.name && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => startEdit(event)}
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    aria-label="Edit event"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600">
            No events match your filters. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;