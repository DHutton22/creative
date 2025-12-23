import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin/supervisor
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["admin", "supervisor", "quality"].includes(userData.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all checklist runs
  const { data: runs, error: runsError } = await supabase
    .from("checklist_runs")
    .select(`
      id,
      status,
      started_at,
      completed_at,
      user_id,
      machine_id,
      machines (id, name),
      users (id, name, email, role),
      checklist_templates (name)
    `)
    .gte("started_at", startDate.toISOString())
    .order("started_at", { ascending: false });

  if (runsError) {
    console.error("Error fetching runs:", runsError);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  // Get counts
  const totalChecklists = runs?.length || 0;
  const completedChecklists = runs?.filter(r => r.status === "completed").length || 0;
  const inProgress = runs?.filter(r => r.status === "in_progress").length || 0;

  // Get failed checks count
  const { count: failedChecks } = await supabase
    .from("checklist_answers")
    .select("*, checklist_runs!inner(*)", { count: "exact", head: true })
    .eq("value", false)
    .gte("checklist_runs.started_at", startDate.toISOString());

  // Get failed answers per user/machine
  const { data: failedAnswersData } = await supabase
    .from("checklist_answers")
    .select(`
      id,
      checklist_runs!inner (
        user_id,
        machine_id,
        started_at
      )
    `)
    .eq("value", false)
    .gte("checklist_runs.started_at", startDate.toISOString());

  // Aggregate user stats
  const userMap = new Map();
  
  (runs || []).forEach((run: any) => {
    if (!run.users) return;
    const userId = run.users.id;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: userId,
        name: run.users.name || "Unknown",
        email: run.users.email || "",
        role: run.users.role || "operator",
        completedChecklists: 0,
        inProgressChecklists: 0,
        failedChecks: 0,
        lastActive: null,
      });
    }
    
    const stats = userMap.get(userId);
    if (run.status === "completed") {
      stats.completedChecklists++;
    } else if (run.status === "in_progress") {
      stats.inProgressChecklists++;
    }
    
    const runTime = run.completed_at || run.started_at;
    if (!stats.lastActive || new Date(runTime) > new Date(stats.lastActive)) {
      stats.lastActive = runTime;
    }
  });

  // Add failed checks to users
  (failedAnswersData || []).forEach((answer: any) => {
    const userId = answer.checklist_runs?.user_id;
    if (userId && userMap.has(userId)) {
      userMap.get(userId).failedChecks++;
    }
  });

  const userStats = Array.from(userMap.values()).sort(
    (a: any, b: any) => b.completedChecklists - a.completedChecklists
  );

  // Aggregate machine stats
  const machineMap = new Map();
  
  (runs || []).forEach((run: any) => {
    if (!run.machines) return;
    const machineId = run.machines.id;
    
    if (!machineMap.has(machineId)) {
      machineMap.set(machineId, {
        id: machineId,
        name: run.machines.name,
        completedChecklists: 0,
        totalRuns: 0,
        failedChecks: 0,
        compliance: 100,
      });
    }
    
    const stats = machineMap.get(machineId);
    stats.totalRuns++;
    if (run.status === "completed") {
      stats.completedChecklists++;
    }
  });

  // Add failed checks to machines
  (failedAnswersData || []).forEach((answer: any) => {
    const machineId = answer.checklist_runs?.machine_id;
    if (machineId && machineMap.has(machineId)) {
      machineMap.get(machineId).failedChecks++;
    }
  });

  // Calculate compliance
  machineMap.forEach((stats) => {
    stats.compliance = stats.totalRuns > 0 
      ? Math.round((stats.completedChecklists / stats.totalRuns) * 100)
      : 100;
  });

  const machineStats = Array.from(machineMap.values()).sort(
    (a: any, b: any) => b.completedChecklists - a.completedChecklists
  );

  // Build recent activity
  const recentActivity = (runs || []).slice(0, 20).map((run: any) => ({
    id: run.id,
    type: run.status === "completed" ? "checklist_completed" : 
          run.status === "aborted" ? "checklist_aborted" : "checklist_started",
    userId: run.users?.id || "",
    userName: run.users?.name || "Unknown",
    machineName: run.machines?.name || "Unknown",
    templateName: run.checklist_templates?.name || "Unknown",
    time: run.completed_at || run.started_at,
  }));

  // Monthly data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const { count: monthTotal } = await supabase
      .from("checklist_runs")
      .select("*", { count: "exact", head: true })
      .gte("started_at", monthStart.toISOString())
      .lt("started_at", monthEnd.toISOString());

    const { count: monthCompleted } = await supabase
      .from("checklist_runs")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("started_at", monthStart.toISOString())
      .lt("started_at", monthEnd.toISOString());

    const total = monthTotal || 0;
    const completed = monthCompleted || 0;
    
    monthlyData.push({
      month: monthStart.toLocaleString("default", { month: "short" }),
      total,
      completed,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return NextResponse.json({
    stats: {
      totalChecklists,
      completedChecklists,
      failedChecks: failedChecks || 0,
      inProgress,
      activeUsers: userMap.size,
    },
    userStats,
    machineStats,
    recentActivity,
    monthlyData,
  });
}


