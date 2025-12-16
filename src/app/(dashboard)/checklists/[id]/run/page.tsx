"use client";

import { use } from "react";
import Link from "next/link";

export default function ChecklistRunPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="p-6">
      <Link href={`/checklists/${resolvedParams.id}`} className="text-blue-600 hover:underline mb-4 block">
        ← Back to Checklist
      </Link>
      <h1 className="text-2xl font-bold mb-6">Run Checklist</h1>
      <p className="text-gray-600">Checklist run interface coming soon...</p>
    </div>
  );
}
