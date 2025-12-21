import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReferrals, createReferral } from "@/lib/db";

// GET - List all referrals (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await getReferrals();
    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

// POST - Create new referral (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.referrer_name || !body.referrer_email || !body.patient_name || !body.patient_needs) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const referral = await createReferral({
      referrer_name: body.referrer_name,
      referrer_email: body.referrer_email,
      referrer_organization: body.referrer_organization,
      referrer_role: body.referrer_role,
      patient_name: body.patient_name,
      patient_email: body.patient_email,
      patient_phone: body.patient_phone,
      patient_needs: body.patient_needs,
      additional_info: body.additional_info,
    });

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Failed to submit referral" },
      { status: 500 }
    );
  }
}
