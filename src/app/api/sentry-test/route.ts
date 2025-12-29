import { NextResponse } from "next/server";
import { captureApiError } from "@/lib/sentry";

// Test endpoint for Sentry server-side error tracking
export async function GET() {
  try {
    // Simulate an error
    throw new Error("Test server-side error from /api/sentry-test");
  } catch (error) {
    console.error("Test error triggered:", error);
    captureApiError(error, {
      endpoint: "/api/sentry-test",
      method: "GET",
      featureArea: "admin",
      dbOperation: "read",
    });
    return NextResponse.json(
      { error: "Test error captured and sent to Sentry" },
      { status: 500 }
    );
  }
}
