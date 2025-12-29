// This file is used to register server-side instrumentation
// It runs once when the server starts

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Import server-side Sentry config
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Import edge runtime Sentry config
    await import("../sentry.edge.config");
  }
}
