import * as Sentry from "@sentry/nextjs";

/**
 * Sentry utility functions for consistent error tracking across the application.
 *
 * Recommended Custom Tags:
 * - page_type: "public" | "admin" | "api" - Categorizes where errors originate
 * - user_role: "admin" | "visitor" - User context for the error
 * - feature_area: "auth" | "events" | "forms" | "grants" | "referrals" | "donations" | "admin" | "email"
 * - form_type: Specific form type (e.g., "contact", "volunteer", "host-event")
 * - event_id: When error relates to a specific event
 * - db_operation: "read" | "write" | "delete" - For database-related errors
 * - email_type: "admin_notification" | "confirmation" - For email-related errors
 * - oauth_provider: "google" | "github" | "azure" | "apple" - For auth-related errors
 * - api_endpoint: The specific API endpoint that had an error
 * - request_method: "GET" | "POST" | "PUT" | "DELETE"
 */

export type FeatureArea =
  | "auth"
  | "events"
  | "forms"
  | "grants"
  | "referrals"
  | "donations"
  | "admin"
  | "email";

export type DbOperation = "read" | "write" | "delete";

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiErrorContext {
  endpoint: string;
  method: RequestMethod;
  featureArea: FeatureArea;
  formType?: string;
  eventId?: string | number;
  dbOperation?: DbOperation;
  emailType?: "admin_notification" | "confirmation";
  userId?: string;
  isAdmin?: boolean;
}

/**
 * Capture an API error with full context tags
 */
export function captureApiError(error: unknown, context: ApiErrorContext): void {
  Sentry.withScope((scope) => {
    // Set standard API tags
    scope.setTag("page_type", "api");
    scope.setTag("api_endpoint", context.endpoint);
    scope.setTag("request_method", context.method);
    scope.setTag("feature_area", context.featureArea);

    // Set optional context tags
    if (context.formType) {
      scope.setTag("form_type", context.formType);
    }
    if (context.eventId) {
      scope.setTag("event_id", String(context.eventId));
    }
    if (context.dbOperation) {
      scope.setTag("db_operation", context.dbOperation);
    }
    if (context.emailType) {
      scope.setTag("email_type", context.emailType);
    }
    if (context.isAdmin !== undefined) {
      scope.setTag("user_role", context.isAdmin ? "admin" : "visitor");
    }
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    // Capture the error
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), "error");
    }
  });
}

/**
 * Capture a database error with context
 */
export function captureDbError(
  error: unknown,
  operation: DbOperation,
  featureArea: FeatureArea,
  additionalContext?: Record<string, string | number | boolean>
): void {
  Sentry.withScope((scope) => {
    scope.setTag("db_operation", operation);
    scope.setTag("feature_area", featureArea);

    if (additionalContext) {
      Object.entries(additionalContext).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), "error");
    }
  });
}

/**
 * Capture an email error with context
 */
export function captureEmailError(
  error: unknown,
  emailType: "admin_notification" | "confirmation",
  formType?: string
): void {
  Sentry.withScope((scope) => {
    scope.setTag("feature_area", "email");
    scope.setTag("email_type", emailType);
    if (formType) {
      scope.setTag("form_type", formType);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), "error");
    }
  });
}

/**
 * Capture an authentication error with context
 */
export function captureAuthError(
  error: unknown,
  provider?: string
): void {
  Sentry.withScope((scope) => {
    scope.setTag("feature_area", "auth");
    if (provider) {
      scope.setTag("oauth_provider", provider);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), "error");
    }
  });
}

/**
 * Set user context for the current scope
 */
export function setUserContext(
  userId: string,
  isAdmin: boolean,
  email?: string
): void {
  Sentry.setUser({
    id: userId,
    email,
  });
  Sentry.setTag("user_role", isAdmin ? "admin" : "visitor");
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Log a structured message with context
 */
export function logWithContext(
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal",
  message: string,
  context?: Record<string, string | number | boolean>
): void {
  const { logger } = Sentry;

  // Add context to the log
  if (context) {
    logger[level](message, context);
  } else {
    logger[level](message);
  }
}

// Re-export Sentry for direct access when needed
export { Sentry };
