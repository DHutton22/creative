import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Server-side endpoint to fetch the current user's profile.
// This is more reliable than fetching from the browser because the
// session cookie is read server-side and the request runs in a stable
// network environment (no ad-blockers, no CORS preflights, no browser
// extensions).
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError) {
      console.error("[/api/me] Error fetching profile:", profileError);
      return NextResponse.json({ user: null, error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("[/api/me] Exception:", err);
    return NextResponse.json({ user: null, error: "Internal error" }, { status: 500 });
  }
}
