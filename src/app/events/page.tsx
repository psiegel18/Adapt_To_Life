import { Metadata } from "next";
import { getEvents, DbEvent } from "@/lib/db";
import {
  upcomingEvents as staticEvents,
  formatDate,
  getCategoryColor,
  getCategoryLabel,
  Event,
} from "@/data/events";

export const metadata: Metadata = {
  title: "Events | AdaptToLife",
  description:
    "Join our upcoming adaptive sports events, wheelchair basketball games, swimming sessions, and community gatherings.",
};

// Revalidate every 60 seconds
export const revalidate = 60;

async function getEventsData(): Promise<Event[]> {
  try {
    // Try to fetch from database
    const dbEvents = await getEvents();
    if (dbEvents && dbEvents.length > 0) {
      // Transform database events to match the Event interface
      return dbEvents.map((event: DbEvent) => ({
        id: event.id.toString(),
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description,
        category: event.category,
        imageUrl: event.image_url,
        registrationUrl: event.registration_url,
      }));
    }
  } catch (error) {
    console.error("Error fetching events from database:", error);
  }
  // Fall back to static events
  return staticEvents;
}

export default async function EventsPage() {
  const events = await getEventsData();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Find an event that&apos;s right for you. All skill levels welcome!
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No upcoming events at this time. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getCategoryColor(event.category)}`}
                    >
                      {getCategoryLabel(event.category)}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      {event.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{event.description}</p>

                    <div className="space-y-3 text-sm text-gray-500 border-t pt-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(event.date)}
                          </p>
                          <p>{event.time}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
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
                        <p>{event.location}</p>
                      </div>
                    </div>

                    {event.registrationUrl ? (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Register
                      </a>
                    ) : (
                      <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Learn More
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want to Host an Event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We&apos;re always looking for partners and venues to expand our
            programs. If you&apos;re interested in hosting an adaptive sports
            event, we&apos;d love to hear from you.
          </p>
          <a
            href="mailto:info@adapttolife.org"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
