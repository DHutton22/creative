import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// POST - Send login instructions to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    // Get user email if only ID provided
    let userEmail = email;
    if (!userEmail && userId) {
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      userEmail = user.email;
    }

    // Send password reset email (this is the standard way to let users set their password)
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      userEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
      }
    );

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Login instructions sent to ${userEmail}`,
    });
  } catch (error) {
    console.error("Error sending credentials:", error);
    return NextResponse.json(
      { error: "Failed to send login instructions" },
      { status: 500 }
    );
  }
}







