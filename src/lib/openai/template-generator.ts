import type { ChecklistDefinition, ChecklistSection, ChecklistItem } from "@/types/database";
import { v4 as uuidv4 } from "uuid";

interface GenerateTemplateParams {
  machineType: string;
  manufacturer?: string;
  model?: string;
  checklistType: "pre_run" | "first_off" | "shutdown" | "maintenance" | "safety" | "quality";
  additionalContext?: string;
}

interface GeneratedTemplate {
  name: string;
  type: string;
  definition: ChecklistDefinition;
}

const SYSTEM_PROMPT = `You are an expert in CNC machine operations, manufacturing safety, and quality control in the aerospace and automotive industries. You help create detailed, industry-standard checklists for machine operators.

Your task is to generate structured checklist definitions in JSON format. Each checklist should follow best practices for:
- Machine safety (PPE, guards, emergency stops)
- Machine readiness (alarms, services, fluids)
- Quality control (tooling, fixtures, program verification)
- Traceability (batch numbers, job information)

Generate checklists that are practical, thorough, and suitable for operators in a composites/aerospace manufacturing environment.

IMPORTANT: Return ONLY valid JSON without markdown code blocks or any other formatting.`;

const TYPE_DESCRIPTIONS = {
  pre_run: "Pre-run checks performed before starting a production run",
  first_off: "First-off inspection checks for the first part produced",
  shutdown: "End-of-shift or shutdown checks",
  maintenance: "Maintenance inspection checklist",
  safety: "Safety inspection checklist",
  quality: "Quality control checklist",
};

export async function generateChecklistTemplate(
  params: GenerateTemplateParams
): Promise<GeneratedTemplate> {
  const { machineType, manufacturer, model, checklistType, additionalContext } = params;

  const userPrompt = `Generate a ${TYPE_DESCRIPTIONS[checklistType]} for the following machine:

Machine Type: ${machineType}
${manufacturer ? `Manufacturer: ${manufacturer}` : ""}
${model ? `Model: ${model}` : ""}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Generate a comprehensive checklist with 4-6 sections, each containing 3-6 items. The checklist should be suitable for aerospace/automotive manufacturing with high traceability requirements.

Return the response as a JSON object with this exact structure:
{
  "name": "Template name",
  "sections": [
    {
      "title": "Section title",
      "description": "Optional section description",
      "items": [
        {
          "label": "Check item description",
          "type": "yes_no" | "numeric" | "text" | "photo" | "selection",
          "required": true | false,
          "critical": true | false,
          "helpText": "Optional help text",
          "minValue": number (for numeric),
          "maxValue": number (for numeric),
          "unit": "string (for numeric)",
          "options": ["option1", "option2"] (for selection)
        }
      ]
    }
  ]
}

Make sure to mark safety-critical items with "critical": true. These items will block checklist completion if they fail.`;

  try {
    const response = await fetch("/api/ai/generate-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate template");
    }

    const data = await response.json();
    const parsed = JSON.parse(data.content);

    // Add UUIDs to sections and items
    const sections: ChecklistSection[] = parsed.sections.map((section: Omit<ChecklistSection, 'id'> & { items: Omit<ChecklistItem, 'id'>[] }) => ({
      id: uuidv4(),
      title: section.title,
      description: section.description,
      items: section.items.map((item) => ({
        id: uuidv4(),
        label: item.label,
        type: item.type || "yes_no",
        required: item.required ?? true,
        critical: item.critical ?? false,
        helpText: item.helpText,
        minValue: item.minValue,
        maxValue: item.maxValue,
        unit: item.unit,
        options: item.options,
      })),
    }));

    return {
      name: parsed.name || `${machineType} - ${checklistType.replace("_", " ")}`,
      type: checklistType,
      definition: { sections },
    };
  } catch (error) {
    console.error("Error generating template:", error);
    // Return a default template on error
    return getDefaultTemplate(params);
  }
}

function getDefaultTemplate(params: GenerateTemplateParams): GeneratedTemplate {
  const { machineType, checklistType } = params;

  const defaultSections: ChecklistSection[] = [
    {
      id: uuidv4(),
      title: "Safety & Environment",
      description: "Personal safety and work area checks",
      items: [
        {
          id: uuidv4(),
          label: "Required PPE worn (safety glasses, safety boots, hearing protection)",
          type: "yes_no",
          required: true,
          critical: true,
        },
        {
          id: uuidv4(),
          label: "Work area free of trip hazards and debris",
          type: "yes_no",
          required: true,
          critical: false,
        },
        {
          id: uuidv4(),
          label: "Emergency exits and fire equipment accessible",
          type: "yes_no",
          required: true,
          critical: true,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Machine Status",
      description: "Machine safety and readiness checks",
      items: [
        {
          id: uuidv4(),
          label: "No lock-out/tag-out devices fitted to the machine",
          type: "yes_no",
          required: true,
          critical: true,
        },
        {
          id: uuidv4(),
          label: "Control powers up normally with no active alarms",
          type: "yes_no",
          required: true,
          critical: true,
        },
        {
          id: uuidv4(),
          label: "All guards, doors and interlocks operating correctly",
          type: "yes_no",
          required: true,
          critical: true,
        },
        {
          id: uuidv4(),
          label: "Emergency stop tested and accessible",
          type: "yes_no",
          required: true,
          critical: true,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Services & Fluids",
      description: "Check machine services and fluid levels",
      items: [
        {
          id: uuidv4(),
          label: "Air pressure within specified range",
          type: "numeric",
          required: true,
          critical: false,
          unit: "bar",
          minValue: 5,
          maxValue: 8,
        },
        {
          id: uuidv4(),
          label: "Coolant/lubricant level above minimum",
          type: "yes_no",
          required: true,
          critical: false,
        },
        {
          id: uuidv4(),
          label: "No visible leaks or damage",
          type: "yes_no",
          required: true,
          critical: false,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Workholding & Tooling",
      description: "Verify fixtures and tooling are correct",
      items: [
        {
          id: uuidv4(),
          label: "Correct fixture/tooling installed for this job",
          type: "yes_no",
          required: true,
          critical: false,
        },
        {
          id: uuidv4(),
          label: "Fixtures clean and secure",
          type: "yes_no",
          required: true,
          critical: false,
        },
        {
          id: uuidv4(),
          label: "Tools inspected for wear or damage",
          type: "yes_no",
          required: true,
          critical: false,
        },
      ],
    },
  ];

  return {
    name: `${machineType} - ${checklistType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
    type: checklistType,
    definition: { sections: defaultSections },
  };
}

export { getDefaultTemplate };


