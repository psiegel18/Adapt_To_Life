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

  // Create grant applications table
  await sql`
    CREATE TABLE IF NOT EXISTS grant_applications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      sport VARCHAR(100) NOT NULL,
      need TEXT NOT NULL,
      story TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create referrals table
  await sql`
    CREATE TABLE IF NOT EXISTS referrals (
      id SERIAL PRIMARY KEY,
      referrer_name VARCHAR(255) NOT NULL,
      referrer_email VARCHAR(255) NOT NULL,
      referrer_organization VARCHAR(255),
      referrer_role VARCHAR(100),
      patient_name VARCHAR(255) NOT NULL,
      patient_email VARCHAR(255),
      patient_phone VARCHAR(50),
      patient_needs TEXT NOT NULL,
      additional_info TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
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

// Grant Application types
export interface GrantApplication {
  id: number;
  name: string;
  email: string;
  phone?: string;
  sport: string;
  need: string;
  story?: string;
  status: "pending" | "approved" | "denied" | "in_review";
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Get all grant applications
export async function getGrantApplications(): Promise<GrantApplication[]> {
  const sql = getDb();
  const applications = await sql`
    SELECT * FROM grant_applications
    ORDER BY created_at DESC
  `;
  return applications as GrantApplication[];
}

// Create a grant application
export async function createGrantApplication(
  application: Omit<GrantApplication, "id" | "status" | "notes" | "created_at" | "updated_at">
): Promise<GrantApplication> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO grant_applications (name, email, phone, sport, need, story)
    VALUES (${application.name}, ${application.email}, ${application.phone || null}, ${application.sport}, ${application.need}, ${application.story || null})
    RETURNING *
  `;
  return result[0] as GrantApplication;
}

// Update grant application status
export async function updateGrantApplication(
  id: number,
  updates: { status?: string; notes?: string }
): Promise<GrantApplication | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE grant_applications
    SET
      status = COALESCE(${updates.status || null}, status),
      notes = COALESCE(${updates.notes || null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return (result[0] as GrantApplication) || null;
}

// Delete grant application
export async function deleteGrantApplication(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM grant_applications WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}

// Referral types
export interface Referral {
  id: number;
  referrer_name: string;
  referrer_email: string;
  referrer_organization?: string;
  referrer_role?: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  patient_needs: string;
  additional_info?: string;
  status: "pending" | "contacted" | "enrolled" | "closed";
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Get all referrals
export async function getReferrals(): Promise<Referral[]> {
  const sql = getDb();
  const referrals = await sql`
    SELECT * FROM referrals
    ORDER BY created_at DESC
  `;
  return referrals as Referral[];
}

// Create a referral
export async function createReferral(
  referral: Omit<Referral, "id" | "status" | "notes" | "created_at" | "updated_at">
): Promise<Referral> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO referrals (referrer_name, referrer_email, referrer_organization, referrer_role, patient_name, patient_email, patient_phone, patient_needs, additional_info)
    VALUES (${referral.referrer_name}, ${referral.referrer_email}, ${referral.referrer_organization || null}, ${referral.referrer_role || null}, ${referral.patient_name}, ${referral.patient_email || null}, ${referral.patient_phone || null}, ${referral.patient_needs}, ${referral.additional_info || null})
    RETURNING *
  `;
  return result[0] as Referral;
}

// Update referral status
export async function updateReferral(
  id: number,
  updates: { status?: string; notes?: string }
): Promise<Referral | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE referrals
    SET
      status = COALESCE(${updates.status || null}, status),
      notes = COALESCE(${updates.notes || null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return (result[0] as Referral) || null;
}

// Delete referral
export async function deleteReferral(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM referrals WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}
