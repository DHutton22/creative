"use client";

import Link from "next/link";

export default function NewChecklistPage() {
  return (
    <div className="p-6">
      <Link href="/checklists" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Checklists
      </Link>
      <h1 className="text-2xl font-bold mb-6">Start New Checklist</h1>
      <p className="text-gray-600">Checklist creation form coming soon...</p>
    </div>
  );
}
