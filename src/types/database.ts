// User types
export type UserRole = "admin" | "supervisor" | "operator" | "maintenance" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Machine types
export type MachineStatus = "available" | "in_use" | "under_maintenance" | "locked_out" | "decommissioned";
export type RiskCategory = "normal" | "high_risk" | "aerospace";

export interface Machine {
  id: string;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  serial_number?: string | null;
  location?: string | null;
  description?: string | null;
  status: MachineStatus;
  risk_category: RiskCategory;
  work_centre_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MachineInsert {
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  serial_number?: string | null;
  location?: string | null;
  description?: string | null;
  status?: MachineStatus;
  risk_category?: RiskCategory;
  work_centre_id?: string | null;
}

// Checklist Template types
export type ChecklistType = "pre_run" | "first_off" | "shutdown" | "maintenance" | "safety" | "quality";
export type TemplateStatus = "draft" | "active" | "deprecated";
export type ChecklistItemType = "yes_no" | "numeric" | "text";

export interface ChecklistItem {
  id: string;
  label?: string;
  question?: string; // Legacy format
  type: ChecklistItemType;
  required: boolean;
  critical: boolean;
  helpText?: string;
  hint?: string;
  guidance?: string; // Legacy format
  minValue?: number;
  maxValue?: number;
  min_value?: number; // Legacy format
  max_value?: number; // Legacy format
  unit?: string;
  options?: string[];
  referenceImageUrl?: string; // Reference image - "it should look like this"
  reference_image_url?: string; // Legacy format
}

export interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

export interface ChecklistDefinition {
  sections: ChecklistSection[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: ChecklistType;
  version: number;
  status: TemplateStatus;
  machine_id?: string | null;
  json_definition?: ChecklistDefinition | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplateInsert {
  name: string;
  type: ChecklistType;
  status?: TemplateStatus;
  machine_id?: string | null;
  json_definition?: ChecklistDefinition | null;
}

// Checklist Run types
export type ChecklistRunStatus = "in_progress" | "completed" | "aborted";

export interface ChecklistRun {
  id: string;
  template_id: string;
  machine_id: string;
  user_id: string;
  status: ChecklistRunStatus;
  started_at: string;
  completed_at?: string | null;
  job_number?: string | null;
  part_number?: string | null;
  program_name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistRunInsert {
  template_id: string;
  machine_id: string;
  user_id: string;
  status?: ChecklistRunStatus;
  job_number?: string | null;
  part_number?: string | null;
  program_name?: string | null;
  notes?: string | null;
}

// Checklist Answer types
export interface ChecklistAnswer {
  id: string;
  run_id: string;
  section_id: string;
  item_id: string;
  value: boolean | number | string | null;
  comment?: string | null;
  photo_url?: string | null;
  answered_at: string;
  created_at: string;
}

export interface ChecklistAnswerInsert {
  run_id: string;
  section_id: string;
  item_id: string;
  value: boolean | number | string | null;
  comment?: string | null;
  photo_url?: string | null;
}

// Maintenance Task types
export type MaintenanceTaskType = "preventative" | "corrective";
export type MaintenanceTaskStatus = "upcoming" | "due" | "overdue" | "completed" | "cancelled";
export type ScheduleType = "time_based" | "usage_based" | "mixed";

export interface MaintenanceTask {
  id: string;
  name: string;
  description?: string | null;
  type: MaintenanceTaskType;
  schedule_type: ScheduleType;
  machine_id?: string | null;
  mould_id?: string | null;
  template_id?: string | null;
  assigned_to?: string | null;
  interval_days?: number | null;
  interval_cycles?: number | null;
  due_at?: string | null;
  last_completed_at?: string | null;
  status: MaintenanceTaskStatus;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTaskInsert {
  name: string;
  description?: string | null;
  type?: MaintenanceTaskType;
  schedule_type?: ScheduleType;
  machine_id?: string | null;
  mould_id?: string | null;
  template_id?: string | null;
  assigned_to?: string | null;
  interval_days?: number | null;
  interval_cycles?: number | null;
  status?: MaintenanceTaskStatus;
}

// Work Centre types
export interface WorkCentre {
  id: string;
  name: string;
  description?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Issue types
export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Issue {
  id: string;
  title: string;
  description?: string | null;
  machine_id?: string | null;
  checklist_run_id?: string | null;
  reported_by: string;
  assigned_to?: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Mould types
export interface Mould {
  id: string;
  name: string;
  description?: string | null;
  shot_count: number;
  created_at: string;
  updated_at: string;
}
