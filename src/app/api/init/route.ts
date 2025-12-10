import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase } from "@/lib/db";

// POST /api/init - Initialize database tables (admin only, run once)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDatabase();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
