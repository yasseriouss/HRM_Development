import { db } from "@hrm-development/db";
import { 
  skillsTable, 
  departmentsTable, 
  employeesTable, 
  evaluationSummariesTable 
} from "@hrm-development/db/schema";
import { sql } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-001";

export async function getAIStrategicInsights() {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  // Fetch aggregated data for context
  const departments = await db.select().from(departmentsTable);
  const employeeCount = await db.select({ count: sql<number>`count(*)` }).from(employeesTable);
  const avgScores = await db.select({
    avg: sql<number>`avg(overall_score)`
  }).from(evaluationSummariesTable);

  const prompt = `
You are an Elite HR Strategic AI for a "Dark Industrial-Luxury" themed Skill Matrix System.
Analyze the following organizational data and provide 3-5 high-impact strategic insights.

DATA SUMMARY:
- Total Departments: ${departments.length}
- Total Employees: ${employeeCount[0].count}
- Average Skill Matrix Score: ${avgScores[0].avg?.toFixed(2) || "N/A"}
- Departments: ${departments.map(d => d.name).join(", ")}

INSIGHT REQUIREMENTS:
1. Tone: Professional, authoritative, "Industrial-Luxury" (precise, structural, sophisticated).
2. Focus: Identify potential skill bottlenecks, leadership opportunities, or critical gaps.
3. Format: Return a JSON array of objects with "title", "content", and "priority" (Low, Medium, High).

Example JSON Output:
[
  {
    "title": "PRECISION_GAP_DETECTED",
    "content": "A 12% decline in technical proficiency across the Production sector suggests an immediate need for advanced CNC certification workflows.",
    "priority": "High"
  }
]
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hrm-development.vercel.app",
        "X-Title": "HRM Skill Matrix System"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenRouter Error:", error);
      throw new Error(`AI Service Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : (parsed.insights || [parsed]);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return [{
        title: "ANALYSIS_STREAM_INTERRUPTED",
        content: "The intelligence feed returned an unstructured payload. Tactical oversight recommended.",
        priority: "Medium"
      }];
    }
  } catch (error) {
    console.error("AI Insight Error:", error);
    throw error;
  }
}
