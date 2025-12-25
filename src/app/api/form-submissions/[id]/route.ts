import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateFormSubmission, deleteFormSubmission } from "@/lib/db";

// PUT - Update form submission status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const submission = await updateFormSubmission(parseInt(id), { status, notes });
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error updating form submission:", error);
    return NextResponse.json(
      { error: "Failed to update form submission" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a form submission (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteFormSubmission(parseInt(id));
    if (!deleted) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form submission:", error);
    return NextResponse.json(
      { error: "Failed to delete form submission" },
      { status: 500 }
    );
  }
}
