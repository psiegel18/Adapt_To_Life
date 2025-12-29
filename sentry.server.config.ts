import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e4e9bf8b991f08e045a0dbc0314d37c7@o4510452629700608.ingest.us.sentry.io/4510616478220288",

  // Performance Monitoring - sample 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logging for structured logs
  _experiments: {
    enableLogs: true,
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV || "development",
});

// Server-side tag utilities
export function setApiContext(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE"
) {
  Sentry.setTag("api_endpoint", endpoint);
  Sentry.setTag("request_method", method);
  Sentry.setTag("page_type", "api");
}

export function setDbContext(operation: "read" | "write" | "delete") {
  Sentry.setTag("db_operation", operation);
}

export function setEmailContext(emailType: "admin_notification" | "confirmation") {
  Sentry.setTag("email_type", emailType);
}

export function setAuthContext(provider?: string) {
  Sentry.setTag("feature_area", "auth");
  if (provider) {
    Sentry.setTag("oauth_provider", provider);
  }
}

export function setFeatureArea(
  area:
    | "auth"
    | "events"
    | "forms"
    | "grants"
    | "referrals"
    | "donations"
    | "admin"
    | "email"
) {
  Sentry.setTag("feature_area", area);
}

export function setFormContext(formType: string) {
  Sentry.setTag("form_type", formType);
}

export function setEventContext(eventId: string | number) {
  Sentry.setTag("event_id", String(eventId));
}
