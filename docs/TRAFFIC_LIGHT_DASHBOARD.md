# Traffic Light Dashboard - Implementation Complete

## Overview

The Traffic Light Dashboard provides a visual management system for checklist compliance using a color-coded status system:

- 🟢 **Green (On Time)** - Checklist has >3 days until due date
- 🟡 **Amber (Due Soon)** - Checklist due within 3 days
- 🔴 **Red (Overdue)** - Checklist is past the due date

## Features Implemented

### 1. Frequency Tracking ✅
Checklists can now be assigned a frequency:
- **Once** - One-time checklist
- **Daily** - Must be completed every day
- **Weekly** - Must be completed every week
- **Monthly** - Must be completed every month
- **Quarterly** - Must be completed every 3 months
- **Annually** - Must be completed every year

### 2. Due Date Management ✅
- Each checklist run can have a `due_date`
- Automatic calculation of days overdue
- Visual indicators showing time remaining
- Configurable threshold for "due soon" warning (default: 3 days)

### 3. Traffic Light Dashboard ✅
**Location:** `/dashboard`

Features:
- **Visual Status Cards**: Large, clickable cards showing counts
- **Status Filtering**: Click status card to filter by that status
- **Checklist Cards**: Clickable cards showing:
  - Traffic light indicator (emoji)
  - Template name
  - Machine name
  - Frequency
  - Days until due/overdue
  - Due date
- **Responsive Design**: Works on all screen sizes
- **Real-time Status**: Auto-calculates based on current date

### 4. Database Enhancements ✅
**New Fields:**
- `checklist_templates.frequency` - How often checklist should be completed
- `checklist_runs.due_date` - When checklist is due

**New Database Objects:**
- SQL function: `calculate_next_due_date()` - Calculates next due date based on frequency
- View: `checklist_compliance_status` - Pre-calculated compliance status for reporting
- Indexes for efficient querying

### 5. API Endpoint ✅
**Route:** `/api/checklist-status`

Returns:
```typescript
{
  checklists: [
    {
      id: string;
      template_name: string;
      machine_name: string | null;
      frequency: ChecklistFrequency | null;
      status: "in_progress" | "completed";
      due_date: string | null;
      compliance_status: "on_time" | "due_soon" | "overdue" | "completed";
      days_overdue: number;
    }
  ]
}
```

## Files Created/Modified

### New Files
1. `/src/components/TrafficLightDashboard.tsx` - Main dashboard component
2. `/src/app/(dashboard)/dashboard/page.tsx` - Dashboard page
3. `/src/app/api/checklist-status/route.ts` - Status API
4. `/supabase/add-frequency-and-due-dates.sql` - Database migration
5. `/docs/TRAFFIC_LIGHT_DASHBOARD.md` - This documentation

### Modified Files
1. `/src/types/database.ts` - Added frequency and compliance types
2. `/src/components/layout/sidebar.tsx` - Added Dashboard link
3. `/src/app/page.tsx` - Redirect to dashboard

## Setup Instructions

### 1. Run Database Migration

Execute in Supabase SQL Editor:

```sql
-- Run the complete migration
-- File: /supabase/add-frequency-and-due-dates.sql
```

This adds:
- `frequency` column to `checklist_templates`
- `due_date` column to `checklist_runs`
- Helper function `calculate_next_due_date()`
- View `checklist_compliance_status`
- Performance indexes

### 2. Update Existing Templates (Optional)

Set frequencies for existing templates:

```sql
-- Example: Set frequencies based on type
UPDATE checklist_templates 
SET frequency = 'daily' 
WHERE type = 'pre_run' AND frequency IS NULL;

UPDATE checklist_templates 
SET frequency = 'weekly' 
WHERE type = 'safety' AND frequency IS NULL;

UPDATE checklist_templates 
SET frequency = 'monthly' 
WHERE type = 'maintenance' AND frequency IS NULL;
```

### 3. Set Due Dates for In-Progress Checklists

```sql
-- Set due dates for existing in-progress checklists
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '1 day'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'daily';

-- Repeat for other frequencies
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '7 days'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'weekly';
```

### 4. Access the Dashboard

Navigate to: **`/dashboard`**

Or click **"Dashboard"** in the main navigation menu.

## Usage Guide

### For Administrators

#### Creating Templates with Frequency

When creating a checklist template:

```json
{
  "name": "Daily Safety Check",
  "type": "safety",
  "frequency": "daily",
  "machine_id": "...",
  "json_definition": { ... }
}
```

#### Setting Due Dates

When creating a checklist run, calculate due date based on frequency:

```typescript
const dueDateCalculations = {
  daily: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  weekly: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  monthly: () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  },
  quarterly: () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  },
  annually: () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  },
};
```

### For Operators

#### Understanding Status Colors

**🟢 Green - On Time**
- Checklist has plenty of time
- No immediate action needed
- More than 3 days until due date

**🟡 Amber - Due Soon**
- Checklist should be completed soon
- Action needed within 3 days
- Don't delay!

**🔴 Red - Overdue**
- Checklist is past due date
- **Immediate action required**
- Shows number of days overdue

#### Using the Dashboard

1. **View Status Summary**: See counts of checklists by status
2. **Filter by Status**: Click status card to see only those checklists
3. **Complete Checklists**: Click checklist card to continue/complete
4. **Check Due Dates**: See when each checklist is due

## Traffic Light Rules

### Status Calculation Logic

```typescript
const calculateStatus = (dueDate: Date | null, status: string) => {
  if (status === "completed") return "completed";
  if (!dueDate) return "on_time"; // No due date = on time
  
  const now = new Date();
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDue < 0) return "overdue"; // Past due
  if (daysUntilDue <= 3) return "due_soon"; // Within 3 days
  return "on_time"; // More than 3 days
};
```

### Configurable Threshold

The "due soon" threshold is configurable:

```tsx
<TrafficLightDashboard dueSoonThreshold={3} />
// Change to 5 days: dueSoonThreshold={5}
// Change to 1 day: dueSoonThreshold={1}
```

## Example Scenarios

### Scenario 1: Daily Pre-Run Check

- **Template**: "Daily Safety Inspection"
- **Frequency**: Daily
- **Due Date**: Started today at 8am, due tomorrow at 8am
- **Status at 6pm today**: 🟢 Green (14 hours remaining)
- **Status at 7am tomorrow**: 🟡 Amber (1 hour remaining)
- **Status at 9am tomorrow**: 🔴 Red (1 hour overdue)

### Scenario 2: Weekly Safety Audit

- **Template**: "Weekly Safety Audit"
- **Frequency**: Weekly
- **Due Date**: Due Friday at 5pm
- **Status on Monday**: 🟢 Green (4 days remaining)
- **Status on Wednesday**: 🟡 Amber (2 days remaining)
- **Status on Saturday**: 🔴 Red (1 day overdue)

### Scenario 3: Monthly Maintenance

- **Template**: "Monthly Equipment Service"
- **Frequency**: Monthly
- **Due Date**: Due on 30th of month
- **Status on 15th**: 🟢 Green (15 days remaining)
- **Status on 28th**: 🟡 Amber (2 days remaining)
- **Status on 2nd of next month**: 🔴 Red (3 days overdue)

## Benefits

### 1. Visual Management
- Instant status overview
- No need to read detailed reports
- Colors catch attention immediately

### 2. Proactive Compliance
- See what's due soon before it's overdue
- Prevent missed checklists
- Better planning

### 3. Accountability
- Clear visibility of overdue items
- Easy to identify problem areas
- Track compliance trends

### 4. User-Friendly
- Simple traffic light metaphor
- Intuitive color coding
- Minimal training needed

### 5. Flexible
- Configurable thresholds
- Multiple frequencies supported
- Works with any checklist type

## Best Practices

### Setting Frequencies

**Daily**: Use for critical recurring checks
- Pre-run inspections
- Daily safety checks
- Opening/closing procedures

**Weekly**: Use for regular maintenance
- Weekly safety audits
- Equipment inspections
- Housekeeping checks

**Monthly**: Use for detailed reviews
- Monthly maintenance
- Deep cleaning
- Compliance audits

**Quarterly/Annually**: Use for infrequent tasks
- Major inspections
- Annual certifications
- Quarterly reviews

### Managing Due Dates

1. **Set realistic deadlines**: Consider workload and complexity
2. **Account for weekends**: Don't set Friday deadlines for daily tasks
3. **Add buffer time**: Set due dates earlier than absolute deadline
4. **Review regularly**: Check dashboard daily for status
5. **Complete on time**: Don't let items go into amber/red

### Threshold Configuration

**Shorter Threshold (1-2 days)**:
- For urgent, quick tasks
- High-frequency checklists
- Time-critical processes

**Standard Threshold (3 days)**:
- Most checklists (default)
- Balanced warning time
- Good for weekly tasks

**Longer Threshold (5-7 days)**:
- Monthly/quarterly tasks
- Complex checklists
- Tasks requiring planning

## Troubleshooting

### Checklists Not Showing on Dashboard

**Possible Causes:**
1. No `due_date` set on checklist_runs
2. Status is not "in_progress"
3. Template has no frequency set

**Solution:**
```sql
-- Check if checklists have due dates
SELECT id, template_id, status, due_date 
FROM checklist_runs 
WHERE status = 'in_progress';

-- Set due dates for in-progress checklists
UPDATE checklist_runs 
SET due_date = started_at + INTERVAL '1 day'
WHERE status = 'in_progress' AND due_date IS NULL;
```

### Wrong Status Colors

**Check:**
1. Server time zone matches your local time
2. Due dates are set correctly
3. Status calculation logic is working

**Debug:**
```typescript
// Check API response
fetch('/api/checklist-status')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Performance Issues

**Optimize:**
1. Ensure indexes are created (run migration)
2. Limit query to recent checklists only
3. Add caching if needed

```sql
-- Check if indexes exist
SELECT * FROM pg_indexes 
WHERE tablename = 'checklist_runs';
```

## Future Enhancements

Potential improvements:
- [ ] Email notifications for overdue checklists
- [ ] Auto-create next checklist when previous completed
- [ ] Compliance trends and analytics
- [ ] Customizable status thresholds per template
- [ ] Mobile push notifications
- [ ] SMS alerts for critical overdue items
- [ ] Integration with maintenance scheduler
- [ ] Export compliance reports

## Summary

✅ **Traffic Light Dashboard is complete and ready to use!**

**Key Features:**
- 🟢🟡🔴 Visual status system
- Frequency tracking (daily, weekly, monthly, etc.)
- Due date management
- Overdue calculations
- Filterable dashboard
- Real-time status updates
- Mobile-responsive design

**Access:** Navigate to `/dashboard` or click "Dashboard" in the menu

**Next Steps:**
1. Run database migration
2. Set frequencies on templates
3. Set due dates on active checklists
4. Train users on traffic light system
5. Monitor compliance daily

Enjoy your new visual management system! 🚦✅

