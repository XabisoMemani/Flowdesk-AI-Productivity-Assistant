import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-2.5-flash";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI request failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

const EmailInput = z.object({
  purpose: z.string().min(3).max(2000),
  recipient: z.string().min(1).max(60),
  tone: z.string().min(1).max(60),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are an expert professional writer. Write a complete, ready-to-send email. Include a concise subject line on the first line prefixed with 'Subject: ', a greeting, well-structured body paragraphs, and a sign-off. Do not add commentary or markdown.";
    const user = `Write an email with the following details.\n\nPurpose: ${data.purpose}\nRecipient type: ${data.recipient}\nTone: ${data.tone}`;
    const content = await callAI(system, user);
    return { content };
  });

const PlannerInput = z.object({
  tasks: z.string().min(3).max(4000),
});

export const PlanItem = z.object({
  title: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  reason: z.string(),
  deadline: z.string().optional().default(""),
});
export type PlanItem = z.infer<typeof PlanItem>;

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      'You are an expert productivity coach. Given a list of tasks with rough deadlines, return a JSON array only (no markdown, no code fences) of prioritized tasks sorted from most urgent/important to least. Each item must have this exact shape: { "title": string, "priority": "High" | "Medium" | "Low", "reason": string, "deadline": string }. Keep reasons concise (one short sentence). Never wrap the output in ```json fences.';
    const raw = await callAI(system, `Tasks:\n${data.tasks}`);
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("AI returned an unparseable plan. Please try again.");
      parsed = JSON.parse(match[0]);
    }
    const items = z.array(PlanItem).parse(parsed);
    return { items };
  });

const ResearchInput = z.object({
  text: z.string().min(20).max(15000),
});

export const ResearchResult = z.object({
  summary: z.string(),
  insights: z.array(z.string()).min(3).max(6),
});
export type ResearchResult = z.infer<typeof ResearchResult>;

export const researchAnalyze = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      'You are a research assistant. Given the provided content, return a JSON object only (no markdown, no code fences) with this exact shape: { "summary": string, "insights": string[] }. The summary should be 2-4 sentences. Include 3 to 5 concise key insights or takeaways.';
    const raw = await callAI(system, data.text);
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned an unparseable result. Please try again.");
      parsed = JSON.parse(match[0]);
    }
    return ResearchResult.parse(parsed);
  });