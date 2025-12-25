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
      registration_type VARCHAR(20) DEFAULT 'none',
      registration_fields JSONB DEFAULT '[]',
      max_registrations INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add new columns to existing events table if they don't exist
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'registration_type') THEN
        ALTER TABLE events ADD COLUMN registration_type VARCHAR(20) DEFAULT 'none';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'registration_fields') THEN
        ALTER TABLE events ADD COLUMN registration_fields JSONB DEFAULT '[]';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_registrations') THEN
        ALTER TABLE events ADD COLUMN max_registrations INTEGER;
      END IF;
    END $$;
  `;

  // Create event_registrations table
  await sql`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'confirmed',
      notes TEXT,
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

  // Initialize form tables
  await initializeFormTables();
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
  registration_type: "none" | "external" | "internal";
  registration_fields?: FormField[];
  max_registrations?: number;
  created_at: string;
  updated_at: string;
}

// Event registration types
export interface EventRegistration {
  id: number;
  event_id: number;
  data: Record<string, unknown>;
  status: "confirmed" | "waitlisted" | "cancelled";
  notes?: string;
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
    INSERT INTO events (title, date, time, location, description, category, image_url, registration_url, registration_type, registration_fields, max_registrations)
    VALUES (${event.title}, ${event.date}, ${event.time}, ${event.location}, ${event.description}, ${event.category}, ${event.image_url || null}, ${event.registration_url || null}, ${event.registration_type || "none"}, ${event.registration_fields ? JSON.stringify(event.registration_fields) : "[]"}, ${event.max_registrations || null})
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
      registration_type = COALESCE(${event.registration_type || null}, registration_type),
      registration_fields = COALESCE(${event.registration_fields ? JSON.stringify(event.registration_fields) : null}, registration_fields),
      max_registrations = COALESCE(${event.max_registrations !== undefined ? event.max_registrations : null}, max_registrations),
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

// Get event registrations
export async function getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
  const sql = getDb();
  const registrations = await sql`
    SELECT * FROM event_registrations
    WHERE event_id = ${eventId}
    ORDER BY created_at DESC
  `;
  return registrations as EventRegistration[];
}

// Get all registrations (for admin)
export async function getAllEventRegistrations(): Promise<(EventRegistration & { event_title: string; event_date: string })[]> {
  const sql = getDb();
  const registrations = await sql`
    SELECT er.*, e.title as event_title, e.date as event_date
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    ORDER BY er.created_at DESC
  `;
  return registrations as (EventRegistration & { event_title: string; event_date: string })[];
}

// Get registration count for an event
export async function getEventRegistrationCount(eventId: number): Promise<number> {
  const sql = getDb();
  const result = await sql`
    SELECT COUNT(*) as count FROM event_registrations
    WHERE event_id = ${eventId} AND status != 'cancelled'
  `;
  return parseInt(result[0]?.count || "0", 10);
}

// Create event registration
export async function createEventRegistration(
  eventId: number,
  data: Record<string, unknown>
): Promise<EventRegistration> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO event_registrations (event_id, data)
    VALUES (${eventId}, ${JSON.stringify(data)})
    RETURNING *
  `;
  return result[0] as EventRegistration;
}

// Update event registration
export async function updateEventRegistration(
  id: number,
  updates: { status?: string; notes?: string }
): Promise<EventRegistration | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE event_registrations
    SET
      status = COALESCE(${updates.status || null}, status),
      notes = COALESCE(${updates.notes || null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return (result[0] as EventRegistration) || null;
}

// Delete event registration
export async function deleteEventRegistration(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM event_registrations WHERE id = ${id}
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

// Form field configuration
export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
  helpText?: string;
}

// Form configuration
export interface FormConfig {
  id: number;
  form_type: string;
  title: string;
  description: string;
  fields: FormField[];
  submit_button_text: string;
  success_message: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Form submission
export interface FormSubmission {
  id: number;
  form_type: string;
  data: Record<string, unknown>;
  status: "new" | "read" | "replied" | "archived";
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Initialize form tables
export async function initializeFormTables() {
  const sql = getDb();

  // Create form_configs table
  await sql`
    CREATE TABLE IF NOT EXISTS form_configs (
      id SERIAL PRIMARY KEY,
      form_type VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      fields JSONB NOT NULL DEFAULT '[]',
      submit_button_text VARCHAR(100) DEFAULT 'Submit',
      success_message TEXT DEFAULT 'Thank you for your submission!',
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create form_submissions table
  await sql`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id SERIAL PRIMARY KEY,
      form_type VARCHAR(100) NOT NULL,
      data JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'new',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Insert default form configurations
  const defaultForms = [
    {
      form_type: "contact",
      title: "Get in Touch",
      description: "Have a question or want to learn more? Send us a message and we'll get back to you soon.",
      fields: [
        { id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
        { id: "email", type: "email", label: "Email Address", placeholder: "your@email.com", required: true },
        { id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: false },
        { id: "subject", type: "text", label: "Subject", placeholder: "What is this regarding?", required: true },
        { id: "message", type: "textarea", label: "Message", placeholder: "Tell us how we can help...", required: true }
      ],
      submit_button_text: "Send Message",
      success_message: "Thank you for reaching out! We'll get back to you within 2 business days."
    },
    {
      form_type: "volunteer",
      title: "Volunteer With Us",
      description: "Help at events, contribute expertise, or assist with outreach. We'd love to have you on our team!",
      fields: [
        { id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
        { id: "email", type: "email", label: "Email Address", placeholder: "your@email.com", required: true },
        { id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: true },
        { id: "interests", type: "select", label: "Area of Interest", required: true, options: ["Event Support", "Administrative", "Outreach & Marketing", "Coaching/Training", "Other"] },
        { id: "experience", type: "textarea", label: "Relevant Experience", placeholder: "Tell us about your background and skills...", required: false },
        { id: "availability", type: "text", label: "Availability", placeholder: "e.g., Weekends, Evenings, Flexible", required: true },
        { id: "message", type: "textarea", label: "Why do you want to volunteer?", placeholder: "Share your motivation...", required: true }
      ],
      submit_button_text: "Submit Application",
      success_message: "Thank you for your interest in volunteering! We'll review your application and reach out soon."
    },
    {
      form_type: "corporate_sponsorship",
      title: "Corporate Sponsorship",
      description: "Partner with us to make a bigger impact in the community. Let's discuss how we can work together.",
      fields: [
        { id: "contact_name", type: "text", label: "Contact Name", placeholder: "Your name", required: true },
        { id: "company", type: "text", label: "Company Name", placeholder: "Your company", required: true },
        { id: "title", type: "text", label: "Job Title", placeholder: "Your position", required: true },
        { id: "email", type: "email", label: "Email Address", placeholder: "your@company.com", required: true },
        { id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: true },
        { id: "sponsorship_level", type: "select", label: "Sponsorship Interest", required: true, options: ["Event Sponsor", "Program Sponsor", "Annual Partner", "In-Kind Donation", "Not Sure - Let's Discuss"] },
        { id: "message", type: "textarea", label: "Tell us about your interest", placeholder: "Share your goals and how you'd like to partner...", required: true }
      ],
      submit_button_text: "Submit Inquiry",
      success_message: "Thank you for your interest in partnering with us! Our team will reach out within 2 business days to discuss opportunities."
    },
    {
      form_type: "equipment_donation",
      title: "Equipment Donation",
      description: "Donate sport wheelchairs or other adaptive equipment to help athletes in need.",
      fields: [
        { id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
        { id: "email", type: "email", label: "Email Address", placeholder: "your@email.com", required: true },
        { id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: true },
        { id: "equipment_type", type: "text", label: "Equipment Type", placeholder: "e.g., Sport Wheelchair, Hand Cycle", required: true },
        { id: "condition", type: "select", label: "Condition", required: true, options: ["New", "Like New", "Good", "Fair", "Needs Repair"] },
        { id: "description", type: "textarea", label: "Equipment Description", placeholder: "Provide details about the equipment (brand, size, age, any issues)...", required: true },
        { id: "location", type: "text", label: "Pickup Location (City, State)", placeholder: "Where is the equipment located?", required: true }
      ],
      submit_button_text: "Submit Donation",
      success_message: "Thank you for your generous equipment donation! We'll review and contact you to arrange pickup or drop-off details."
    }
  ];

  for (const form of defaultForms) {
    await sql`
      INSERT INTO form_configs (form_type, title, description, fields, submit_button_text, success_message)
      VALUES (${form.form_type}, ${form.title}, ${form.description}, ${JSON.stringify(form.fields)}, ${form.submit_button_text}, ${form.success_message})
      ON CONFLICT (form_type) DO NOTHING
    `;
  }
}

// Get all form configurations
export async function getFormConfigs(): Promise<FormConfig[]> {
  const sql = getDb();
  const configs = await sql`
    SELECT * FROM form_configs
    ORDER BY form_type ASC
  `;
  return configs as FormConfig[];
}

// Get a single form configuration
export async function getFormConfig(formType: string): Promise<FormConfig | null> {
  const sql = getDb();
  const result = await sql`
    SELECT * FROM form_configs WHERE form_type = ${formType}
  `;
  return (result[0] as FormConfig) || null;
}

// Update form configuration
export async function updateFormConfig(
  formType: string,
  updates: Partial<Omit<FormConfig, "id" | "form_type" | "created_at" | "updated_at">>
): Promise<FormConfig | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE form_configs
    SET
      title = COALESCE(${updates.title || null}, title),
      description = COALESCE(${updates.description || null}, description),
      fields = COALESCE(${updates.fields ? JSON.stringify(updates.fields) : null}, fields),
      submit_button_text = COALESCE(${updates.submit_button_text || null}, submit_button_text),
      success_message = COALESCE(${updates.success_message || null}, success_message),
      enabled = COALESCE(${updates.enabled !== undefined ? updates.enabled : null}, enabled),
      updated_at = CURRENT_TIMESTAMP
    WHERE form_type = ${formType}
    RETURNING *
  `;
  return (result[0] as FormConfig) || null;
}

// Get all form submissions
export async function getFormSubmissions(formType?: string): Promise<FormSubmission[]> {
  const sql = getDb();
  if (formType) {
    const submissions = await sql`
      SELECT * FROM form_submissions
      WHERE form_type = ${formType}
      ORDER BY created_at DESC
    `;
    return submissions as FormSubmission[];
  }
  const submissions = await sql`
    SELECT * FROM form_submissions
    ORDER BY created_at DESC
  `;
  return submissions as FormSubmission[];
}

// Create a form submission
export async function createFormSubmission(
  formType: string,
  data: Record<string, unknown>
): Promise<FormSubmission> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO form_submissions (form_type, data)
    VALUES (${formType}, ${JSON.stringify(data)})
    RETURNING *
  `;
  return result[0] as FormSubmission;
}

// Update form submission status
export async function updateFormSubmission(
  id: number,
  updates: { status?: string; notes?: string }
): Promise<FormSubmission | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE form_submissions
    SET
      status = COALESCE(${updates.status || null}, status),
      notes = COALESCE(${updates.notes || null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return (result[0] as FormSubmission) || null;
}

// Delete form submission
export async function deleteFormSubmission(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM form_submissions WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}
