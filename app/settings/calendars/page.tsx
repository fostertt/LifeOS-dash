"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";

interface CalendarSync {
  id: number;
  calendarId: string;
  calendarName: string;
  isEnabled: boolean;
  isPrimary: boolean;
  color?: string;
  lastSyncedAt?: string;
}

export default function CalendarSettings() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<CalendarSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/calendar/settings");

      if (!response.ok) {
        throw new Error("Failed to load calendars");
      }

      const data = await response.json();
      setCalendars(data);
    } catch (err) {
      console.error("Error loading calendars:", err);
      setError(err instanceof Error ? err.message : "Failed to load calendars");
    } finally {
      setLoading(false);
    }
  };

  const syncCalendars = async () => {
    try {
      setSyncing(true);
      setError(null);
      const response = await fetch("/api/calendar/list");

      if (!response.ok) {
        throw new Error("Failed to sync calendars");
      }

      const data = await response.json();
      setCalendars(data);
    } catch (err) {
      console.error("Error syncing calendars:", err);
      setError(err instanceof Error ? err.message : "Failed to sync calendars");
    } finally {
      setSyncing(false);
    }
  };

  const toggleCalendar = async (calendarId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch("/api/calendar/list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId,
          isEnabled: !currentEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update calendar");
      }

      // Update local state
      setCalendars((prev) =>
        prev.map((cal) =>
          cal.calendarId === calendarId
            ? { ...cal, isEnabled: !currentEnabled }
            : cal
        )
      );
    } catch (err) {
      console.error("Error updating calendar:", err);
      setError(err instanceof Error ? err.message : "Failed to update calendar");
    }
  };

  const formatLastSync = (lastSyncedAt?: string) => {
    if (!lastSyncedAt) return "Never";

    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto p-8">
          <Header />

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar Settings</h1>
            <p className="text-gray-600">Manage your Google Calendar connections</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Sync Button */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Sync Calendars</h2>
                <p className="text-sm text-gray-600">
                  Fetch your latest calendars from Google Calendar
                </p>
              </div>
              <button
                onClick={syncCalendars}
                disabled={syncing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {syncing && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </div>

          {/* Calendars List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connected Calendars</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : calendars.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No calendars found</h3>
                <p className="text-gray-600 mb-4">
                  Click "Sync Now" to fetch your Google Calendars
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {calendars.map((calendar) => (
                  <div
                    key={calendar.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: calendar.color || "#8B5CF6" }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {calendar.calendarName}
                          </h3>
                          {calendar.isPrimary && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Last synced: {formatLastSync(calendar.lastSyncedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCalendar(calendar.calendarId, calendar.isEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          calendar.isEnabled ? "bg-purple-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            calendar.isEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Calendar Sync</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Events are fetched live from Google Calendar</li>
                  <li>• Toggle calendars on/off to show or hide their events</li>
                  <li>• Events appear in your day and week views</li>
                  <li>• Click any event to view full details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
