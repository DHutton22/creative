import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      // Return a mock response if no API key is configured
      return NextResponse.json({
        content: JSON.stringify({
          name: "Generated Checklist Template",
          sections: [
            {
              title: "Safety Checks",
              description: "Essential safety verifications",
              items: [
                {
                  label: "Personal Protective Equipment (PPE) worn correctly",
                  type: "yes_no",
                  required: true,
                  critical: true,
                  helpText: "Safety glasses, boots, hearing protection as required",
                },
                {
                  label: "Work area clear of hazards",
                  type: "yes_no",
                  required: true,
                  critical: false,
                },
                {
                  label: "Emergency stop accessible and tested",
                  type: "yes_no",
                  required: true,
                  critical: true,
                },
              ],
            },
            {
              title: "Machine Status",
              description: "Verify machine is ready for operation",
              items: [
                {
                  label: "No active alarms on control panel",
                  type: "yes_no",
                  required: true,
                  critical: true,
                },
                {
                  label: "All guards and interlocks functioning",
                  type: "yes_no",
                  required: true,
                  critical: true,
                },
                {
                  label: "Machine powered up correctly",
                  type: "yes_no",
                  required: true,
                  critical: false,
                },
              ],
            },
            {
              title: "Services Check",
              description: "Verify services and fluids",
              items: [
                {
                  label: "Air pressure reading",
                  type: "numeric",
                  required: true,
                  critical: false,
                  unit: "bar",
                  minValue: 5,
                  maxValue: 8,
                },
                {
                  label: "Coolant level adequate",
                  type: "yes_no",
                  required: true,
                  critical: false,
                },
                {
                  label: "Lubrication system functioning",
                  type: "yes_no",
                  required: true,
                  critical: false,
                },
              ],
            },
          ],
        }),
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate template from OpenAI");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error in generate-template API:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}


