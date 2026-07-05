import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Server-side endpoint for updating a checklist run's status
// (e.g. marking it completed or aborted). Done server-side for the same reason
// as saving answers: the browser Supabase client's writes can hang on its auth
// lock, which would leave operators unable to submit a finished checklist.
const ALLOWED_STATUSES = ["completed", "aborted", "in_progress"] as const;

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
    const { runId, status } = body ?? {};

    if (!runId || !status) {
      return NextResponse.json({ error: "runId and status are required" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: { status: string; completed_at?: string } = { status };
    if (status === "completed" || status === "aborted") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("checklist_runs")
      .update(updateData)
      .eq("id", runId)
      .select()
      .single();

    if (error) {
      console.error("[/api/checklist-runs] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ run: data });
  } catch (err) {
    console.error("[/api/checklist-runs] exception:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
