import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e4e9bf8b991f08e045a0dbc0314d37c7@o4510452629700608.ingest.us.sentry.io/4510616478220288",

  // Performance Monitoring - sample 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV || "development",
});
