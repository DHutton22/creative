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

    // Diagnostic: count the authenticated user's visible checklist_runs under RLS.
    // Helps verify whether browser-side empty results are an auth/cookie problem
    // vs. a data/RLS problem. count: "exact", head: true returns count without rows.
    const { count: runsCount, error: runsCountError } = await supabase
      .from("checklist_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authUser.id);

    console.log(
      `[/api/me] ok user=${authUser.id} role=${profile?.role ?? "?"} runs=${
        runsCountError ? `err:${runsCountError.code ?? "?"}` : runsCount ?? 0
      }`
    );

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("[/api/me] Exception:", err);
    return NextResponse.json({ user: null, error: "Internal error" }, { status: 500 });
  }
}
