import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFormSubmissions, createFormSubmission, getFormConfig } from "@/lib/db";
import { sendAdminNotification, sendConfirmationEmail } from "@/lib/email";

// GET - Get all form submissions (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type") || undefined;

    const submissions = await getFormSubmissions(formType);
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    // Return empty array if table doesn't exist yet
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("does not exist") || errorMessage.includes("relation")) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Failed to fetch form submissions" },
      { status: 500 }
    );
  }
}

// POST - Create a new form submission (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { form_type, data, _honeypot } = body;

    // Spam protection: if honeypot field is filled, silently reject
    if (_honeypot) {
      // Return success to not tip off bots, but don't save
      return NextResponse.json({
        success: true,
        message: "Thank you for your submission!",
        submission: { id: 0 }
      });
    }

    if (!form_type || !data) {
      return NextResponse.json(
        { error: "form_type and data are required" },
        { status: 400 }
      );
    }

    // Verify the form type exists and is enabled
    const formConfig = await getFormConfig(form_type);
    if (!formConfig) {
      return NextResponse.json(
        { error: "Invalid form type" },
        { status: 400 }
      );
    }

    if (!formConfig.enabled) {
      return NextResponse.json(
        { error: "This form is currently disabled" },
        { status: 400 }
      );
    }

    // Validate required fields
    for (const field of formConfig.fields) {
      if (field.required && !data[field.id]) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        );
      }
    }

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const submission = await createFormSubmission(form_type, data);

    // Send emails (non-blocking - don't wait for them)
    Promise.all([
      sendAdminNotification(form_type, data, submission.id),
      sendConfirmationEmail(form_type, data, submission.id, formConfig.success_message)
    ]).catch(err => console.error("Email sending failed:", err));

    return NextResponse.json({
      success: true,
      message: formConfig.success_message,
      submission
    });
  } catch (error) {
    console.error("Error creating form submission:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
