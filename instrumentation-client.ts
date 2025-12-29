import * as Sentry from "@sentry/nextjs";

// Export the router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: "https://e4e9bf8b991f08e045a0dbc0314d37c7@o4510452629700608.ingest.us.sentry.io/4510616478220288",

  // Performance Monitoring - sample 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logging for structured logs
  _experiments: {
    enableLogs: true,
  },

  // Session Replay configuration
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors

  integrations: [
    Sentry.replayIntegration({
      // Privacy settings - don't completely blur everything
      // Only mask sensitive input fields, not all text
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,

      // Mask specific sensitive elements
      mask: [
        // Mask inputs that contain sensitive data
        'input[type="password"]',
        'input[name="ssn"]',
        'input[name="social_security"]',
        'input[name="credit_card"]',
        'input[name="card_number"]',
        'input[name="cvv"]',
        'input[name="phone"]',
        'input[name="address"]',
        'input[name="medical"]',
        // Mask any element with data-sentry-mask attribute
        "[data-sentry-mask]",
        // Mask admin-only content when needed
        ".sentry-mask",
      ],

      // Block elements that should not be recorded at all
      block: [
        // Block any element with data-sentry-block attribute
        "[data-sentry-block]",
        ".sentry-block",
      ],
    }),

    // Console logging integration for error and warning logs
    Sentry.consoleLoggingIntegration({
      levels: ["warn", "error"],
    }),
  ],

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV || "development",
});

// Custom tag utilities for client-side use
export function setPageContext(pageType: "public" | "admin", featureArea?: string) {
  Sentry.setTag("page_type", pageType);
  if (featureArea) {
    Sentry.setTag("feature_area", featureArea);
  }
}

export function setUserContext(role: "admin" | "visitor", userId?: string) {
  Sentry.setTag("user_role", role);
  if (userId) {
    Sentry.setUser({ id: userId });
  }
}

export function setFormContext(formType: string) {
  Sentry.setTag("form_type", formType);
}

export function setEventContext(eventId: string | number) {
  Sentry.setTag("event_id", String(eventId));
}
