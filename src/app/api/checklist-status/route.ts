import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch in-progress and recently completed checklists with compliance status
    const { data: checklists, error } = await supabase
      .from("checklist_runs")
      .select(
        `
        id,
        template_id,
        machine_id,
        user_id,
        status,
        started_at,
        completed_at,
        due_date,
        checklist_templates!inner (
          name,
          frequency
        ),
        machines (
          name
        )
      `
      )
      .in("status", ["in_progress", "completed"])
      .order("due_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching checklists:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate compliance status for each checklist
    const now = new Date();
    const checklistsWithStatus = checklists.map((checklist: any) => {
      let compliance_status = "on_time";
      let days_overdue = 0;

      if (checklist.status === "completed") {
        compliance_status = "completed";
      } else if (checklist.due_date) {
        const dueDate = new Date(checklist.due_date);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          compliance_status = "overdue";
          days_overdue = Math.abs(diffDays);
        } else if (diffDays <= 3) {
          compliance_status = "due_soon";
        } else {
          compliance_status = "on_time";
        }
      }

      return {
        id: checklist.id,
        template_id: checklist.template_id,
        template_name: checklist.checklist_templates?.name || "Unknown",
        machine_name: checklist.machines?.name || null,
        frequency: checklist.checklist_templates?.frequency || null,
        status: checklist.status,
        due_date: checklist.due_date,
        started_at: checklist.started_at,
        completed_at: checklist.completed_at,
        compliance_status,
        days_overdue,
      };
    });

    return NextResponse.json({ checklists: checklistsWithStatus });
  } catch (error) {
    console.error("Error in checklist status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
