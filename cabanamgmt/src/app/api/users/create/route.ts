import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, phone } = body;

    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new user
    const user = await createUser({
      full_name,
      email,
      phone,
      verification_status: "pending",
      screening_status: "pending",
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
