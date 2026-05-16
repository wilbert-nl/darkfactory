import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are Stash's organizer assistant.

Your job: given a snippet of text or a web page summary, decide what folder it belongs to and produce a clean title and a one-sentence summary.

Rules:
- Pick an existing folder if one is a strong fit. Otherwise propose a new folder name (1-3 words, Title Case, no emojis).
- Title: 3-10 words, concise, descriptive. For links, prefer the page's real title if available.
- Summary: one sentence, <=180 characters, factual, no fluff like "this is about".
- Output JSON only, matching the schema. Do not include any other text.`;

export type CategorizeInput = {
  pastedText: string;
  link?: { url: string; pageTitle?: string; pageDescription?: string; pageText?: string };
  existingFolders: string[];
};

export type CategorizeResult = {
  title: string;
  summary: string;
  folderName: string;
  isNewFolder: boolean;
  confidence: "low" | "medium" | "high";
};

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    folder_name: { type: "string" },
    is_new_folder: { type: "boolean" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["title", "summary", "folder_name", "is_new_folder", "confidence"],
  additionalProperties: false,
} as const;

function fallback(input: CategorizeInput): CategorizeResult {
  const raw = input.pastedText.trim();
  const title =
    input.link?.pageTitle?.trim() ||
    raw.split("\n")[0].slice(0, 80) ||
    "Untitled note";
  const summary =
    input.link?.pageDescription?.trim()?.slice(0, 180) ||
    raw.slice(0, 180) ||
    "";
  const folderName = input.existingFolders[0] || "Inbox";
  return {
    title,
    summary,
    folderName,
    isNewFolder: input.existingFolders.length === 0,
    confidence: "low",
  };
}

export async function categorize(input: CategorizeInput): Promise<CategorizeResult> {
  if (!process.env.ANTHROPIC_API_KEY) return fallback(input);

  // Sort folders for cache stability — order changes invalidate the cache.
  const folders = [...input.existingFolders].sort();
  const userPayload = {
    existing_folders: folders,
    pasted_text: input.pastedText.slice(0, 6000),
    link: input.link
      ? {
          url: input.link.url,
          page_title: input.link.pageTitle?.slice(0, 300) ?? null,
          page_description: input.link.pageDescription?.slice(0, 500) ?? null,
          page_text: input.link.pageText?.slice(0, 3500) ?? null,
        }
      : null,
  };

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: SCHEMA as any },
      } as any,
      messages: [{ role: "user", content: JSON.stringify(userPayload) }],
    });

    const block = response.content.find((b) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    if (!block) return fallback(input);

    const parsed = JSON.parse(block.text);
    return {
      title: String(parsed.title || "").trim() || "Untitled",
      summary: String(parsed.summary || "").trim(),
      folderName: String(parsed.folder_name || "Inbox").trim(),
      isNewFolder: Boolean(parsed.is_new_folder),
      confidence: parsed.confidence || "medium",
    };
  } catch (err) {
    console.error("[stash] categorize failed:", err);
    return fallback(input);
  }
}
