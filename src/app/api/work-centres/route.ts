import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  try {
    // Get work centres
    const { data: workCentres, error: wcError } = await supabase
      .from("work_centres")
      .select("*")
      .order("display_order");

    if (wcError) {
      console.error("Error fetching work centres:", wcError);
      return NextResponse.json({ error: wcError.message }, { status: 500 });
    }

    // Get machines
    const { data: machines, error: machineError } = await supabase
      .from("machines")
      .select("*")
      .order("name");

    if (machineError) {
      console.error("Error fetching machines:", machineError);
      return NextResponse.json({ error: machineError.message }, { status: 500 });
    }

    return NextResponse.json({
      workCentres: workCentres || [],
      machines: machines || [],
    });
  } catch (error) {
    console.error("Exception in work-centres API:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}


