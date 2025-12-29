"use client";

import * as Sentry from "@sentry/nextjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page is only for testing Sentry integration
// Protected by admin authentication

export default function SentryTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const triggerClientError = () => {
    throw new Error("Test client-side error from Sentry test page");
  };

  const triggerCapturedError = () => {
    try {
      throw new Error("Test captured error with custom tags");
    } catch (error) {
      Sentry.withScope((scope) => {
        // Set all custom tags to verify they appear in Sentry
        scope.setTag("page_type", "admin");
        scope.setTag("feature_area", "testing");
        scope.setTag("user_role", "admin");
        scope.setTag("form_type", "test_form");
        scope.setTag("event_id", "test_123");
        scope.setTag("db_operation", "read");
        scope.setTag("api_endpoint", "/api/sentry-test");
        scope.setTag("request_method", "GET");
        scope.setLevel("warning");
        Sentry.captureException(error);
      });
      alert(
        "Error captured with tags! Check Sentry for:\n" +
        "- page_type: admin\n" +
        "- feature_area: testing\n" +
        "- user_role: admin\n" +
        "- form_type: test_form\n" +
        "- event_id: test_123\n" +
        "- db_operation: read\n" +
        "- api_endpoint: /api/sentry-test\n" +
        "- request_method: GET"
      );
    }
  };

  const triggerServerError = async () => {
    try {
      const response = await fetch("/api/sentry-test");
      const data = await response.json();
      if (!response.ok) {
        alert(`Server error triggered: ${data.error}`);
      }
    } catch (error) {
      alert("Server error triggered - check Sentry dashboard");
    }
  };

  const triggerMessage = () => {
    Sentry.captureMessage("Test message from Sentry test page", "info");
    alert("Message sent to Sentry!");
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Sentry Integration Test
            </h1>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              Admin Only
            </span>
          </div>
          <p className="text-gray-600 mb-8">
            Use these buttons to test different Sentry features. Check your{" "}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              Sentry dashboard
            </a>{" "}
            to see the captured events.
          </p>

          <div className="space-y-4">
            {/* Client Error Test */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">
                1. Unhandled Client Error
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Throws an unhandled error - tests automatic error capture and
                session replay.
              </p>
              <button
                onClick={triggerClientError}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Trigger Client Error
              </button>
            </div>

            {/* Captured Error Test */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">
                2. Captured Error with All Custom Tags
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Captures an error with all 8 custom tags to verify they appear in Sentry.
              </p>
              <div className="text-xs text-gray-500 mb-3 font-mono bg-gray-50 p-2 rounded">
                page_type, feature_area, user_role, form_type, event_id, db_operation, api_endpoint, request_method
              </div>
              <button
                onClick={triggerCapturedError}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
              >
                Trigger Captured Error
              </button>
            </div>

            {/* Server Error Test */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">
                3. Server-Side Error
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Calls an API endpoint that throws an error - tests server-side
                error tracking.
              </p>
              <button
                onClick={triggerServerError}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Trigger Server Error
              </button>
            </div>

            {/* Message Test */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">
                4. Send Test Message
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Sends an info-level message to Sentry - tests message capture.
              </p>
              <button
                onClick={triggerMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This page is admin-only. Events may take a
              few seconds to appear in Sentry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
