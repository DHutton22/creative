import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Server-side endpoint for raising a machine concern during a checklist run.
// Done server-side so the write doesn't hang on the browser client's auth lock.
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
    const {
      machineId,
      checklistRunId,
      checklistItemId,
      checklistItemName,
      severity,
      description,
      photoUrl,
    } = body ?? {};

    if (!machineId || !description) {
      return NextResponse.json(
        { error: "machineId and description are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("machine_concerns")
      .insert({
        machine_id: machineId,
        checklist_run_id: checklistRunId ?? null,
        checklist_item_id: checklistItemId ?? null,
        checklist_item_name: checklistItemName ?? null,
        raised_by: user.id,
        severity: severity ?? "medium",
        description,
        photo_url: photoUrl ?? null,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("[/api/machine-concerns] insert error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    // Best-effort activity log; never block the concern on it.
    try {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action_type: "concern_raised",
        entity_type: "machine_concern",
        entity_id: machineId,
        machine_id: machineId,
        metadata: { severity: severity ?? "medium", item: checklistItemName ?? null },
      });
    } catch {
      // activity_log may not exist; ignore
    }

    return NextResponse.json({ concern: data });
  } catch (err) {
    console.error("[/api/machine-concerns] exception:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
