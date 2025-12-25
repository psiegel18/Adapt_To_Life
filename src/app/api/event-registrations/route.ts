import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllEventRegistrations,
  getEventRegistrations,
  createEventRegistration,
  getEvent,
  getEventRegistrationCount,
} from "@/lib/db";
import { sendAdminNotification, sendConfirmationEmail } from "@/lib/email";

// GET - Get event registrations (admin only for all, public for specific event count)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");
  const countOnly = searchParams.get("count_only");

  try {
    // Public: get registration count for an event
    if (eventId && countOnly === "true") {
      const count = await getEventRegistrationCount(parseInt(eventId, 10));
      return NextResponse.json({ count });
    }

    // Admin only for full registration data
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (eventId) {
      const registrations = await getEventRegistrations(parseInt(eventId, 10));
      return NextResponse.json(registrations);
    }

    const registrations = await getAllEventRegistrations();
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("does not exist") || errorMessage.includes("relation")) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Failed to fetch event registrations" },
      { status: 500 }
    );
  }
}

// POST - Create a new event registration (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, data, _honeypot } = body;

    // Spam protection: if honeypot field is filled, silently reject
    if (_honeypot) {
      return NextResponse.json({
        success: true,
        message: "Thank you for registering!",
        registration: { id: 0 }
      });
    }

    if (!event_id || !data) {
      return NextResponse.json(
        { error: "event_id and data are required" },
        { status: 400 }
      );
    }

    // Verify the event exists and has internal registration enabled
    const event = await getEvent(parseInt(event_id, 10));
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.registration_type !== "internal") {
      return NextResponse.json(
        { error: "This event does not accept online registrations" },
        { status: 400 }
      );
    }

    // Check capacity if max_registrations is set
    if (event.max_registrations) {
      const currentCount = await getEventRegistrationCount(event.id);
      if (currentCount >= event.max_registrations) {
        return NextResponse.json(
          { error: "This event has reached maximum capacity" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    for (const field of event.registration_fields || []) {
      if (field.required && !data[field.id]) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        );
      }
    }

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const registration = await createEventRegistration(event.id, data);

    // Send emails (non-blocking)
    const successMessage = `You're registered for ${event.title} on ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${event.time}.`;

    Promise.all([
      sendAdminNotification(`event_registration_${event.id}`, { ...data, event_title: event.title, event_date: event.date }, registration.id),
      sendConfirmationEmail(`event_registration_${event.id}`, data, registration.id, successMessage)
    ]).catch(err => console.error("Email sending failed:", err));

    return NextResponse.json({
      success: true,
      message: `You're registered for ${event.title}! We'll see you there.`,
      registration
    });
  } catch (error) {
    console.error("Error creating event registration:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
