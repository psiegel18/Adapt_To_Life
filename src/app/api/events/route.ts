import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEvents, createEvent } from "@/lib/db";

// GET /api/events - Get all events (public)
export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, time, location, description, category, image_url, registration_url } = body;

    if (!title || !date || !time || !location || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await createEvent({
      title,
      date,
      time,
      location,
      description,
      category,
      image_url,
      registration_url,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
