import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeActivity = searchParams.get("activity") === "true";

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch in-progress and recently completed checklists with user info
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
          id,
          name
        ),
        users (
          name
        )
      `
      )
      .in("status", ["in_progress", "completed"])
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching checklists:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate compliance status for each checklist
    const now = new Date();
    const checklistsWithStatus = checklists.map((checklist: any) => {
      const frequency = checklist.checklist_templates?.frequency || 'once';
      const isScheduled = frequency !== 'once' && checklist.due_date;
      
      let compliance_status = "in_progress"; // Default for ad-hoc
      let days_overdue = 0;

      if (checklist.status === "completed") {
        compliance_status = "completed";
      } else if (isScheduled && checklist.due_date) {
        // Only scheduled checklists get traffic light treatment
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
      // Ad-hoc checklists stay as "in_progress" - no pressure, just recording

      return {
        id: checklist.id,
        template_id: checklist.template_id,
        machine_id: checklist.machines?.id || null,
        template_name: checklist.checklist_templates?.name || "Unknown",
        machine_name: checklist.machines?.name || null,
        user_name: checklist.users?.name || null,
        frequency: frequency,
        status: checklist.status,
        due_date: checklist.due_date,
        started_at: checklist.started_at,
        completed_at: checklist.completed_at,
        compliance_status,
        days_overdue,
        is_scheduled: isScheduled,
      };
    });

    // Optionally fetch activity log
    let activity: any[] = [];
    if (includeActivity) {
      const { data: activityData, error: activityError } = await supabase
        .from("activity_log")
        .select(`
          id,
          action_type,
          entity_type,
          entity_id,
          machine_id,
          metadata,
          created_at,
          users (name),
          machines (name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!activityError && activityData) {
        activity = activityData.map((item: any) => ({
          id: item.id,
          action_type: item.action_type,
          user_name: item.users?.name || "Unknown",
          machine_name: item.machines?.name || null,
          created_at: item.created_at,
          metadata: item.metadata,
        }));
      }
    }

    return NextResponse.json({ 
      checklists: checklistsWithStatus,
      ...(includeActivity && { activity }),
    });
  } catch (error) {
    console.error("Error in checklist status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
