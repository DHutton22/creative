# Creative Composites - Machine Checklist System

A comprehensive accountability checklist system for CNC machines and manufacturing processes, built for Creative Composites. This system helps operators complete machine-specific checklists, tracks preventative maintenance, ensures traceability, and provides full audit trails.

## Features

### Core Functionality
- **Machine Management**: Register and manage CNC machines (MAKA, Dieffenbacher presses, etc.)
- **Checklist Builder**: Visual template builder with sections, items, and conditional logic
- **Operator Workflow**: Mobile-friendly checklist execution with photo attachments and comments
- **Maintenance Scheduling**: Time-based and usage-based preventative maintenance
- **Reporting & Analytics**: Compliance dashboards, issue tracking, and audit trails

### Checklist Features
- Yes/No, numeric, text, photo, and selection item types
- Critical items that block completion if failed
- Supervisor override capability
- Conditional comment/photo requirements
- Digital signatures

### Role-Based Access
- **Admin**: Full system access
- **Supervisor**: Template management, override capabilities
- **Operator**: Run checklists, report issues
- **Maintenance**: Maintenance task management
- **Quality**: Reports and audit access

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS (Creative Composites brand colors)
- **AI**: OpenAI API for template generation
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd creative
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openai-api-key (optional, for AI template generation)
```

4. Set up the database:
- Create a new Supabase project
- Run the SQL schema in `supabase/schema.sql` in the Supabase SQL Editor
- This creates all tables, indexes, triggers, and sample data

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app                    # Next.js App Router pages
    /(auth)               # Authentication pages (login, signup)
    /(dashboard)          # Main application pages
      /admin              # Admin pages (templates, users, settings)
      /checklists         # Checklist execution and history
      /machines           # Machine management
      /maintenance        # Maintenance scheduling
      /reports            # Analytics and reporting
  /components
    /ui                   # Reusable UI components
    /layout               # Layout components (sidebar, header)
  /contexts               # React contexts (auth)
  /lib
    /supabase             # Supabase client configuration
    /openai               # AI template generation
    /utils.ts             # Utility functions
  /types
    /database.ts          # TypeScript types for database
/supabase
  /schema.sql             # Database schema
```

## Database Schema

Key tables:
- `users` - User profiles with roles
- `machines` - CNC machines and equipment
- `moulds` - Mould/tooling management
- `checklist_templates` - Checklist template definitions
- `checklist_runs` - Completed/in-progress checklists
- `checklist_answers` - Individual checklist responses
- `maintenance_tasks` - Scheduled maintenance
- `issues` - Issue tracking and resolution

## Brand Colors (Creative Composites)

- Primary Blue: `#0057A8`
- Secondary Gray: `#4A5568`
- Background: `#FFFFFF`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

## Deployment

The application is configured for deployment on Vercel:

```bash
npm run build
```

Then deploy to Vercel or run:
```bash
npx vercel
```

## License

Private - Creative Composites

## Support

For support, contact the development team.
