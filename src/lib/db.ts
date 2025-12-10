import { neon } from "@neondatabase/serverless";

// Create a SQL query function using the Neon serverless driver
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(databaseUrl);
}

// Initialize database tables
export async function initializeDatabase() {
  const sql = getDb();

  // Create events table
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      image_url VARCHAR(500),
      registration_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create settings table for donation link and other config
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Insert default donation link if not exists
  await sql`
    INSERT INTO settings (key, value)
    VALUES ('donation_url', 'https://www.zeffy.com/donation-form/adapt-to-life')
    ON CONFLICT (key) DO NOTHING
  `;
}

// Event types
export interface DbEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: "basketball" | "swimming" | "fitness" | "social" | "other";
  image_url?: string;
  registration_url?: string;
  created_at: string;
  updated_at: string;
}

// Get all events
export async function getEvents(): Promise<DbEvent[]> {
  const sql = getDb();
  const events = await sql`
    SELECT * FROM events
    ORDER BY date ASC
  `;
  return events as DbEvent[];
}

// Get a single event
export async function getEvent(id: number): Promise<DbEvent | null> {
  const sql = getDb();
  const events = await sql`
    SELECT * FROM events WHERE id = ${id}
  `;
  return (events[0] as DbEvent) || null;
}

// Create an event
export async function createEvent(
  event: Omit<DbEvent, "id" | "created_at" | "updated_at">
): Promise<DbEvent> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO events (title, date, time, location, description, category, image_url, registration_url)
    VALUES (${event.title}, ${event.date}, ${event.time}, ${event.location}, ${event.description}, ${event.category}, ${event.image_url || null}, ${event.registration_url || null})
    RETURNING *
  `;
  return result[0] as DbEvent;
}

// Update an event
export async function updateEvent(
  id: number,
  event: Partial<Omit<DbEvent, "id" | "created_at" | "updated_at">>
): Promise<DbEvent | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE events
    SET
      title = COALESCE(${event.title || null}, title),
      date = COALESCE(${event.date || null}, date),
      time = COALESCE(${event.time || null}, time),
      location = COALESCE(${event.location || null}, location),
      description = COALESCE(${event.description || null}, description),
      category = COALESCE(${event.category || null}, category),
      image_url = COALESCE(${event.image_url || null}, image_url),
      registration_url = COALESCE(${event.registration_url || null}, registration_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return (result[0] as DbEvent) || null;
}

// Delete an event
export async function deleteEvent(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM events WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}

// Get a setting
export async function getSetting(key: string): Promise<string | null> {
  const sql = getDb();
  const result = await sql`
    SELECT value FROM settings WHERE key = ${key}
  `;
  return result[0]?.value || null;
}

// Update a setting
export async function updateSetting(key: string, value: string): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
    ON CONFLICT (key)
    DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
  `;
}
