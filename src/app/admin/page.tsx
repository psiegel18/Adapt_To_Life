"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { DbEvent } from "@/lib/db";

type EventFormData = Omit<DbEvent, "id" | "created_at" | "updated_at">;

const emptyEvent: EventFormData = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
  category: "basketball",
  image_url: "",
  registration_url: "",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<DbEvent[]>([]);
  const [donationUrl, setDonationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventFormData>(emptyEvent);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, settingsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/settings?key=donation_url"),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setDonationUrl(settingsData.value || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const initializeDb = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/init", { method: "POST" });
      if (res.ok) {
        showMessage("success", "Database initialized successfully!");
        fetchData();
      } else {
        showMessage("error", "Failed to initialize database");
      }
    } catch {
      showMessage("error", "Failed to initialize database");
    } finally {
      setIsSaving(false);
    }
  };

  const saveDonationUrl = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "donation_url", value: donationUrl }),
      });
      if (res.ok) {
        showMessage("success", "Donation URL updated!");
      } else {
        showMessage("error", "Failed to update donation URL");
      }
    } catch {
      showMessage("error", "Failed to update donation URL");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (res.ok) {
        showMessage(
          "success",
          editingEvent ? "Event updated!" : "Event created!"
        );
        setShowEventForm(false);
        setEditingEvent(null);
        setEventForm(emptyEvent);
        fetchData();
      } else {
        showMessage("error", "Failed to save event");
      }
    } catch {
      showMessage("error", "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Event deleted!");
        fetchData();
      } else {
        showMessage("error", "Failed to delete event");
      }
    } catch {
      showMessage("error", "Failed to delete event");
    }
  };

  const editEvent = (event: DbEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      category: event.category,
      image_url: event.image_url || "",
      registration_url: event.registration_url || "",
    });
    setShowEventForm(true);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Initialize Database Section */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Database Setup
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Click this button once to initialize the database tables. This is
            safe to run multiple times.
          </p>
          <button
            onClick={initializeDb}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Initializing..." : "Initialize Database"}
          </button>
        </section>

        {/* Donation URL Section */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Donation Settings
          </h2>
          <div className="flex gap-4">
            <input
              type="url"
              value={donationUrl}
              onChange={(e) => setDonationUrl(e.target.value)}
              placeholder="https://www.zeffy.com/donation-form/your-form"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={saveDonationUrl}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </section>

        {/* Events Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Events</h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm(emptyEvent);
                setShowEventForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              + Add Event
            </button>
          </div>

          {/* Event Form Modal */}
          {showEventForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {editingEvent ? "Edit Event" : "Add New Event"}
                  </h3>
                  <form onSubmit={handleEventSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.title}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={eventForm.date}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, date: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="6:00 PM - 8:00 PM"
                          value={eventForm.time}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, time: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.location}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={eventForm.category}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            category: e.target.value as EventFormData["category"],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="basketball">Basketball</option>
                        <option value="swimming">Swimming</option>
                        <option value="fitness">Fitness</option>
                        <option value="social">Social</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={eventForm.description}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration URL (optional)
                      </label>
                      <input
                        type="url"
                        value={eventForm.registration_url}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            registration_url: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEventForm(false);
                          setEditingEvent(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isSaving
                          ? "Saving..."
                          : editingEvent
                            ? "Update Event"
                            : "Create Event"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Events List */}
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No events yet. Click &quot;Add Event&quot; to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {event.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.date} | {event.time}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editEvent(event)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
