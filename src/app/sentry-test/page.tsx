"use client";

import * as Sentry from "@sentry/nextjs";

// This page is only for testing Sentry integration
// It should be removed or protected in production

export default function SentryTestPage() {
  const triggerClientError = () => {
    throw new Error("Test client-side error from Sentry test page");
  };

  const triggerCapturedError = () => {
    try {
      throw new Error("Test captured error with custom tags");
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag("test_type", "manual_capture");
        scope.setTag("feature_area", "testing");
        scope.setLevel("warning");
        Sentry.captureException(error);
      });
      alert("Error captured and sent to Sentry!");
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sentry Integration Test
          </h1>
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
                2. Captured Error with Tags
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Manually captures an error with custom tags - tests tag
                filtering in Sentry.
              </p>
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
              <strong>Note:</strong> This page should be removed or protected
              before deploying to production. Events may take a few seconds to
              appear in Sentry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
