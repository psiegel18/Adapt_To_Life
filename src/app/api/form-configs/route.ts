import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFormConfigs, getFormConfig, updateFormConfig } from "@/lib/db";

// GET - Get form configurations (public for single config, admin for all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("form_type");

    if (formType) {
      // Public: get a single form config for rendering
      const config = await getFormConfig(formType);
      if (!config) {
        return NextResponse.json(
          { error: "Form configuration not found. Please initialize the database first." },
          { status: 404 }
        );
      }
      return NextResponse.json(config);
    }

    // Admin only: get all form configs
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await getFormConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching form configs:", error);
    // Return empty array if table doesn't exist yet
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("does not exist") || errorMessage.includes("relation")) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Failed to fetch form configurations" },
      { status: 500 }
    );
  }
}

// PUT - Update a form configuration (admin only)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { form_type, ...updates } = body;

    if (!form_type) {
      return NextResponse.json(
        { error: "form_type is required" },
        { status: 400 }
      );
    }

    const config = await updateFormConfig(form_type, updates);
    if (!config) {
      return NextResponse.json(
        { error: "Form configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating form config:", error);
    return NextResponse.json(
      { error: "Failed to update form configuration" },
      { status: 500 }
    );
  }
}
