import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFormSubmissions, createFormSubmission, getFormConfig } from "@/lib/db";

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
    const { form_type, data } = body;

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

    const submission = await createFormSubmission(form_type, data);
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
