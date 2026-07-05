import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Server-side endpoint for saving a checklist answer (value, comment and/or photo).
//
// Writes are done here rather than from the browser Supabase client because the
// browser client's auth/session subsystem is unreliable in this deployment
// (the navigator.locks-based auth lock can stall, leaving inserts/updates
// hanging forever - which is why answers and comments appeared not to save).
// The server client reads the session straight from the request cookies, so it
// is authenticated and stable, and RLS still applies via the user's identity.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { runId, sectionId, itemId, value, comment, photoUrl } = body ?? {};

    if (!runId || !sectionId || !itemId) {
      return NextResponse.json(
        { error: "runId, sectionId and itemId are required" },
        { status: 400 }
      );
    }

    const answerData = {
      run_id: runId,
      section_id: sectionId,
      item_id: itemId,
      value,
      comment: comment ?? null,
      photo_url: photoUrl ?? null,
      answered_at: new Date().toISOString(),
    };

    // Find an existing answer for this run + item so we update rather than
    // create duplicates.
    const { data: existing, error: existingError } = await supabase
      .from("checklist_answers")
      .select("id")
      .eq("run_id", runId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (existingError) {
      console.error("[/api/checklist-answers] lookup error:", existingError);
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    let saved;
    if (existing?.id) {
      const { data, error } = await supabase
        .from("checklist_answers")
        .update(answerData)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) {
        console.error("[/api/checklist-answers] update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      saved = data;
    } else {
      const { data, error } = await supabase
        .from("checklist_answers")
        .insert(answerData)
        .select()
        .single();
      if (error) {
        console.error("[/api/checklist-answers] insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      saved = data;
    }

    return NextResponse.json({ answer: saved });
  } catch (err) {
    console.error("[/api/checklist-answers] exception:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
