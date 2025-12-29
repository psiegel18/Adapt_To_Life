import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";

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

    // Capture with Sentry directly to ensure it works
    Sentry.withScope((scope) => {
      scope.setTag("page_type", "api");
      scope.setTag("api_endpoint", "/api/sentry-test");
      scope.setTag("request_method", "GET");
      scope.setTag("feature_area", "admin");
      scope.setTag("db_operation", "read");
      scope.setTag("user_role", "admin");
      scope.setTag("test_type", "server_side");

      if (error instanceof Error) {
        Sentry.captureException(error);
      }
    });

    // Flush to ensure the error is sent before response
    await Sentry.flush(2000);

    return NextResponse.json(
      { error: "Test error captured and sent to Sentry" },
      { status: 500 }
    );
  }
}
