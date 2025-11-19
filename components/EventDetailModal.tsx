"use client";

import React from 'react';

export interface CalendarEvent {
  id: string;
  source: 'google' | 'lifeos';
  calendarId: string;
  calendarName: string;
  calendarColor?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  timezone: string;
  htmlLink?: string;
}

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: event.isAllDay ? undefined : '2-digit',
      minute: event.isAllDay ? undefined : '2-digit',
      timeZoneName: event.isAllDay ? undefined : 'short',
    });
  };

  const formatTimeRange = () => {
    if (event.isAllDay) {
      return 'All Day';
    }

    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    return `${start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: event.calendarColor || '#8B5CF6' }}
              />
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            </div>
            <span className="text-sm text-gray-600">{event.calendarName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Time */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="font-semibold text-gray-900">{formatTimeRange()}</div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDateTime(event.startTime)}
              </div>
              {event.timezone !== 'America/New_York' && (
                <div className="text-xs text-gray-500 mt-1">
                  Timezone: {event.timezone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <div className="text-gray-900">{event.location}</div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-700 mt-1 inline-block"
                >
                  Open in Maps →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="text-gray-700 whitespace-pre-wrap">{event.description}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          {event.source === 'google' && event.htmlLink && (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-center"
            >
              Open in Google Calendar
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
