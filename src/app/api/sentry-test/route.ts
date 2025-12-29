import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";

// Test endpoint for Sentry server-side error tracking (admin only)
export async function GET() {
  // Require admin authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      isAdmin: true,
    });
    return NextResponse.json(
      { error: "Test error captured and sent to Sentry" },
      { status: 500 }
    );
  }
}
