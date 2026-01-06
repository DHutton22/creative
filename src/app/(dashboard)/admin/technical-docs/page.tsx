"use client";

import { BRAND } from "@/lib/branding";

const BRAND_BLUE = BRAND.PRIMARY_BLUE;

interface DocSection {
  title: string;
  icon: string;
  content: React.ReactNode;
}

export default function TechnicalDocsPage() {
  const sections: DocSection[] = [
    {
      title: "System Overview",
      icon: "🏗️",
      content: (
        <>
          <p>
            The Creative Composites Machine Checklist System is a modern web application 
            designed for managing machine checklists, operator workflows, and compliance tracking.
          </p>
          <div style={{ background: "#f0f9ff", padding: "16px", borderRadius: "8px", marginTop: "12px" }}>
            <strong>Key Capabilities:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Digital checklists replacing paper-based systems</li>
              <li>Photo capture directly from device cameras</li>
              <li>Real-time compliance monitoring dashboard</li>
              <li>User management with role-based access</li>
              <li>Complete audit trail of all checklist submissions</li>
              <li>Works on desktop, tablet, and mobile devices</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      title: "Technology Stack",
      icon: "⚙️",
      content: (
        <>
          <p>The system is built using industry-standard, well-supported technologies:</p>
          
          <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
            <TechCard
              name="Next.js 16"
              type="Frontend & Backend Framework"
              description="A React-based framework by Vercel. Powers both the user interface and the server-side logic. Chosen for its excellent performance, SEO capabilities, and developer experience."
              link="https://nextjs.org"
            />
            <TechCard
              name="Supabase"
              type="Database & Authentication"
              description="An open-source Firebase alternative. Handles all data storage, user authentication, and file storage (photos). Chosen for its PostgreSQL database, real-time capabilities, and excellent security features."
              link="https://supabase.com"
            />
            <TechCard
              name="Vercel"
              type="Hosting & Deployment"
              description="The platform that hosts the application. Provides automatic deployments, SSL certificates, and global CDN. The same company that makes Next.js, ensuring optimal compatibility."
              link="https://vercel.com"
            />
            <TechCard
              name="TypeScript"
              type="Programming Language"
              description="A typed superset of JavaScript. Helps catch errors during development and makes the codebase more maintainable and self-documenting."
              link="https://typescriptlang.org"
            />
          </div>
        </>
      ),
    },
    {
      title: "Why Supabase?",
      icon: "🎯",
      content: (
        <>
          <p>Supabase was chosen as the backend platform for several important reasons:</p>
          
          <div style={{ marginTop: "16px" }}>
            <ReasonCard
              title="PostgreSQL Database"
              description="Uses PostgreSQL, the world's most advanced open-source database. Your data is stored in a proven, reliable format that's been trusted by enterprises for decades."
              icon="🐘"
            />
            <ReasonCard
              title="Built-in Authentication"
              description="Handles user login, password security, and session management out of the box. No need to build complex security systems from scratch."
              icon="🔐"
            />
            <ReasonCard
              title="Row Level Security (RLS)"
              description="Database-level security ensures users can only access data they're authorised to see. Even if there's a bug in the application code, the database itself enforces permissions."
              icon="🛡️"
            />
            <ReasonCard
              title="File Storage"
              description="Secure storage for checklist photos and reference images. Integrates seamlessly with the database."
              icon="📁"
            />
            <ReasonCard
              title="No Vendor Lock-in"
              description="Supabase is open source. If needed, the entire system can be migrated to a self-hosted version or another PostgreSQL provider without losing data."
              icon="🔓"
            />
            <ReasonCard
              title="Real-time Capabilities"
              description="Built-in support for real-time updates, useful for live dashboards and notifications (can be enabled as needed)."
              icon="⚡"
            />
          </div>
        </>
      ),
    },
    {
      title: "Monthly Costs",
      icon: "💰",
      content: (
        <>
          <p>The system runs on the following subscription plans:</p>
          
          <div style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
            <CostCard
              service="Supabase Pro"
              cost="$25/month"
              includes={[
                "8GB database storage",
                "250GB bandwidth",
                "100GB file storage",
                "Daily automated backups",
                "7-day backup retention",
                "No project pausing (always online)",
                "Email support",
              ]}
              note="The Pro plan ensures the system is always available and includes proper backups. The free tier pauses projects after inactivity, which is unsuitable for production use."
            />
            <CostCard
              service="Vercel Pro (Optional)"
              cost="$20/month"
              includes={[
                "Unlimited bandwidth",
                "Faster builds",
                "Team collaboration features",
                "Advanced analytics",
                "Preview deployments",
              ]}
              note="The free Vercel tier is often sufficient for most use cases. Pro is recommended if you need team access or higher traffic."
            />
          </div>
          
          <div style={{ 
            background: "#fef3c7", 
            padding: "16px", 
            borderRadius: "8px", 
            marginTop: "16px",
            border: "1px solid #fcd34d" 
          }}>
            <strong>💡 Cost Summary:</strong>
            <p style={{ margin: "8px 0 0 0" }}>
              Minimum monthly cost: <strong>$25/month</strong> (Supabase Pro only)<br />
              Recommended: <strong>$45/month</strong> (Supabase Pro + Vercel Pro)
            </p>
          </div>
        </>
      ),
    },
    {
      title: "Data & Security",
      icon: "🔒",
      content: (
        <>
          <p>Security and data protection are built into every layer:</p>
          
          <div style={{ marginTop: "16px" }}>
            <SecurityItem
              title="HTTPS Everywhere"
              description="All data transmitted between users and the system is encrypted using TLS/SSL."
            />
            <SecurityItem
              title="Password Hashing"
              description="User passwords are never stored in plain text. They're hashed using bcrypt, an industry-standard algorithm."
            />
            <SecurityItem
              title="Row Level Security"
              description="Database policies ensure users can only access their own data and data they're authorised to see based on their role."
            />
            <SecurityItem
              title="Daily Backups"
              description="Supabase Pro includes automatic daily backups with 7-day retention. Point-in-time recovery is available."
            />
            <SecurityItem
              title="Data Location"
              description="Data is stored in Supabase's EU or US data centres. The exact region can be configured based on compliance requirements."
            />
            <SecurityItem
              title="Audit Trail"
              description="All checklist submissions include timestamps and user IDs, creating a complete audit trail for compliance purposes."
            />
          </div>
        </>
      ),
    },
    {
      title: "Accessing the Database",
      icon: "🗄️",
      content: (
        <>
          <p>The database can be accessed and managed through several methods:</p>
          
          <div style={{ marginTop: "16px" }}>
            <AccessMethod
              title="Supabase Dashboard"
              description="The primary way to view and manage data. Accessible via app.supabase.com with your login credentials."
              steps={[
                "Go to app.supabase.com",
                "Log in with the account that owns the project",
                "Select the Creative Composites project",
                "Use the Table Editor to view/edit data",
              ]}
            />
            <AccessMethod
              title="SQL Editor"
              description="For advanced queries, the Supabase dashboard includes a SQL editor where you can run custom queries."
              steps={[
                "In the Supabase dashboard, click 'SQL Editor'",
                "Write your SQL query",
                "Click 'Run' to execute",
              ]}
            />
            <AccessMethod
              title="Direct Database Connection"
              description="For database tools like pgAdmin, DBeaver, or DataGrip, you can connect directly using the connection string."
              steps={[
                "In Supabase dashboard, go to Settings → Database",
                "Copy the connection string",
                "Paste into your database tool",
              ]}
            />
          </div>
        </>
      ),
    },
    {
      title: "Deployment & Updates",
      icon: "🚀",
      content: (
        <>
          <p>The application uses continuous deployment via GitHub and Vercel:</p>
          
          <div style={{ 
            background: "#f8fafc", 
            padding: "20px", 
            borderRadius: "8px", 
            marginTop: "16px",
            border: "1px solid #e2e8f0" 
          }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>How Updates Work:</h4>
            <ol style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
              <li>Code changes are pushed to the GitHub repository</li>
              <li>Vercel automatically detects the changes</li>
              <li>A new build is created and tested</li>
              <li>If successful, the new version goes live automatically</li>
              <li>Previous versions are kept and can be rolled back if needed</li>
            </ol>
          </div>
          
          <div style={{ marginTop: "16px" }}>
            <p><strong>Repository:</strong></p>
            <code style={{ 
              display: "block", 
              padding: "12px", 
              background: "#1e293b", 
              color: "#e2e8f0", 
              borderRadius: "6px",
              fontSize: "13px",
              overflowX: "auto"
            }}>
              https://github.com/darrengalvin/creative
            </code>
          </div>
          
          <div style={{ marginTop: "16px" }}>
            <p><strong>Production URL:</strong></p>
            <code style={{ 
              display: "block", 
              padding: "12px", 
              background: "#1e293b", 
              color: "#e2e8f0", 
              borderRadius: "6px",
              fontSize: "13px",
              overflowX: "auto"
            }}>
              https://creative-pi-mocha.vercel.app
            </code>
          </div>
        </>
      ),
    },
    {
      title: "Support & Maintenance",
      icon: "🛠️",
      content: (
        <>
          <p>For ongoing support and maintenance:</p>
          
          <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
            <SupportCard
              level="Application Issues"
              description="Bugs, feature requests, or changes to the application"
              contact="Contact the development team who built the system"
            />
            <SupportCard
              level="Database Issues"
              description="Data recovery, performance issues, or Supabase-specific problems"
              contact="Supabase support (included with Pro plan) or the development team"
            />
            <SupportCard
              level="Hosting Issues"
              description="Downtime, deployment failures, or domain/SSL issues"
              contact="Vercel support or the development team"
            />
          </div>
          
          <div style={{ 
            background: "#ecfdf5", 
            padding: "16px", 
            borderRadius: "8px", 
            marginTop: "16px",
            border: "1px solid #a7f3d0" 
          }}>
            <strong>📋 Recommended Maintenance:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Monitor Supabase dashboard for storage/bandwidth usage</li>
              <li>Review database backups monthly</li>
              <li>Keep an eye on Vercel deployment logs for any errors</li>
              <li>Periodically review user access and remove unused accounts</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      title: "Key Credentials & Access",
      icon: "🔑",
      content: (
        <>
          <div style={{ 
            background: "#fef2f2", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "16px",
            border: "1px solid #fecaca" 
          }}>
            <strong>⚠️ Important:</strong> These credentials should be stored securely and only 
            shared with authorised personnel. Never share these publicly.
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Service</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>What It's For</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Where to Find</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Supabase Dashboard</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Database management, user auth settings</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>app.supabase.com</td>
              </tr>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Vercel Dashboard</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Deployments, domain settings, logs</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>vercel.com</td>
              </tr>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>GitHub Repository</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Source code, version history</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>github.com/darrengalvin/creative</td>
              </tr>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Environment Variables</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>API keys, database URLs</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Vercel Project Settings → Environment Variables</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px", 
          padding: "6px 12px", 
          background: "#dbeafe", 
          borderRadius: "6px",
          marginBottom: "12px",
          fontSize: "13px",
          fontWeight: "500",
          color: "#1e40af"
        }}>
          📚 Technical Documentation
        </div>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          color: "#111827", 
          margin: "0 0 8px 0" 
        }}>
          System Technical Guide
        </h1>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "15px" }}>
          Everything your technical team needs to know about the Creative Composites Machine Checklist System
        </p>
      </div>

      {/* Quick Links */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "8px", 
        marginBottom: "32px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}>
        <span style={{ fontSize: "14px", color: "#6b7280", marginRight: "8px" }}>Jump to:</span>
        {sections.map((section, i) => (
          <a
            key={i}
            href={`#section-${i}`}
            style={{
              padding: "4px 12px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#374151",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            {section.icon} {section.title}
          </a>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {sections.map((section, i) => (
          <div
            key={i}
            id={`section-${i}`}
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <div style={{ 
              padding: "16px 20px", 
              background: "#f8fafc", 
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "24px" }}>{section.icon}</span>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                {section.title}
              </h2>
            </div>
            <div style={{ padding: "20px", fontSize: "14px", lineHeight: "1.7", color: "#374151" }}>
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: "32px", 
        padding: "20px", 
        background: "#f8fafc", 
        borderRadius: "12px",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "13px"
      }}>
        Last updated: January 2026 • Creative Composites Machine Checklist System
      </div>
    </div>
  );
}

// Helper Components

function TechCard({ name, type, description, link }: { name: string; type: string; description: string; link: string }) {
  return (
    <div style={{ 
      padding: "16px", 
      background: "#f8fafc", 
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <strong style={{ color: "#111827" }}>{name}</strong>
          <span style={{ 
            marginLeft: "8px", 
            fontSize: "12px", 
            padding: "2px 8px", 
            background: "#dbeafe", 
            color: "#1e40af", 
            borderRadius: "4px" 
          }}>
            {type}
          </span>
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ 
          fontSize: "12px", 
          color: "#0057A8",
          textDecoration: "none"
        }}>
          Learn more →
        </a>
      </div>
      <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{description}</p>
    </div>
  );
}

function ReasonCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div style={{ 
      display: "flex", 
      gap: "12px", 
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9"
    }}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <div>
        <strong style={{ color: "#111827", display: "block", marginBottom: "4px" }}>{title}</strong>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>{description}</span>
      </div>
    </div>
  );
}

function CostCard({ service, cost, includes, note }: { service: string; cost: string; includes: string[]; note: string }) {
  return (
    <div style={{ 
      padding: "20px", 
      background: "#f8fafc", 
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <strong style={{ fontSize: "16px", color: "#111827" }}>{service}</strong>
        <span style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          color: "#0057A8" 
        }}>
          {cost}
        </span>
      </div>
      <ul style={{ margin: "0 0 12px 0", paddingLeft: "20px", fontSize: "13px", color: "#374151" }}>
        {includes.map((item, i) => (
          <li key={i} style={{ marginBottom: "4px" }}>{item}</li>
        ))}
      </ul>
      <p style={{ 
        margin: 0, 
        fontSize: "12px", 
        color: "#6b7280", 
        fontStyle: "italic",
        paddingTop: "12px",
        borderTop: "1px solid #e2e8f0"
      }}>
        {note}
      </p>
    </div>
  );
}

function SecurityItem({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ 
      display: "flex", 
      gap: "12px", 
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9"
    }}>
      <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
      <div>
        <strong style={{ color: "#111827", display: "block", marginBottom: "4px" }}>{title}</strong>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>{description}</span>
      </div>
    </div>
  );
}

function AccessMethod({ title, description, steps }: { title: string; description: string; steps: string[] }) {
  return (
    <div style={{ 
      padding: "16px", 
      background: "#f8fafc", 
      borderRadius: "8px",
      marginBottom: "12px",
      border: "1px solid #e2e8f0"
    }}>
      <strong style={{ color: "#111827", display: "block", marginBottom: "4px" }}>{title}</strong>
      <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#6b7280" }}>{description}</p>
      <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#374151" }}>
        {steps.map((step, i) => (
          <li key={i} style={{ marginBottom: "4px" }}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function SupportCard({ level, description, contact }: { level: string; description: string; contact: string }) {
  return (
    <div style={{ 
      padding: "16px", 
      background: "#f8fafc", 
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}>
      <strong style={{ color: "#111827", display: "block", marginBottom: "4px" }}>{level}</strong>
      <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b7280" }}>{description}</p>
      <span style={{ fontSize: "12px", color: "#0057A8" }}>→ {contact}</span>
    </div>
  );
}

