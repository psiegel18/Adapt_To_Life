import { Metadata } from "next";
import { getEvents, DbEvent, FormField } from "@/lib/db";
import { upcomingEvents as staticEvents } from "@/data/events";
import EventCard from "./EventCard";

export const metadata: Metadata = {
  title: "Events | AdaptToLife",
  description:
    "Join our upcoming adaptive sports events, wheelchair basketball games, swimming sessions, and community gatherings.",
};

// Revalidate every 60 seconds
export const revalidate = 60;

interface ExtendedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: "basketball" | "swimming" | "fitness" | "social" | "other";
  imageUrl?: string;
  registrationUrl?: string;
  registrationType?: "none" | "external" | "internal";
  registrationFields?: FormField[];
  maxRegistrations?: number;
}

async function getEventsData(): Promise<ExtendedEvent[]> {
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
        registrationType: event.registration_type || "none",
        registrationFields: event.registration_fields,
        maxRegistrations: event.max_registrations,
      }));
    }
  } catch (error) {
    console.error("Error fetching events from database:", error);
  }
  // Fall back to static events (without registration features)
  return staticEvents.map((event) => ({
    ...event,
    registrationType: "none" as const,
  }));
}

export default async function EventsPage() {
  const events = await getEventsData();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-[#FF6B35] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
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
                <EventCard key={event.id} event={event} />
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
            className="inline-block bg-[#FF6B35] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e55a2a] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
