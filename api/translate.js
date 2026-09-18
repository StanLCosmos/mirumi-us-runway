import Anthropic from "@anthropic-ai/sdk";

import { authorized } from "./_store.js";

const MODEL = "claude-opus-5";
const MAX_INPUT = 200;

// Board labels, not prose: the reply has to be droppable straight into a field.
const SYSTEM = `You translate short labels on a project schedule for a consumer robotics company launching a product in the United States. The labels name work items and categories: shipments, warehouse moves, retail pop-ups, online store activity, regulatory compliance.

Reply with the translation and nothing else — no quotation marks, no romanisation, no explanation, no alternatives.

Match the length and register of the input. These labels sit in a narrow column, so keep them about as short as what you were given.

Leave product, company and retailer names, and established acronyms, as they are: mirumi, Yukai, Nordstrom, FAO Schwarz, Japan House, Meekins, MKS, Yamato, Santoku, F1, EC, 3PL, CPSIA, FCC, UN38.3, HTS.

If the input is already in the target language, return it unchanged.`;

function pickText(message) {
  return (message.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }
  // Translating costs money, so it sits behind the same password as writing.
  if (!authorized(req)) return res.status(401).json({ error: "edit password required" });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "translation not configured" });
  }

  const input = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const text = String(input.text == null ? "" : input.text).trim();
  const to = input.to === "ja" ? "ja" : input.to === "en" ? "en" : null;

  if (!to) return res.status(400).json({ error: "target must be en or ja" });
  if (!text) return res.status(400).json({ error: "nothing to translate" });
  if (text.length > MAX_INPUT) return res.status(400).json({ error: "text too long" });

  const request = {
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    // A label is not a reasoning problem; low effort keeps it quick and cheap.
    output_config: { effort: "low" },
    messages: [
      {
        role: "user",
        content: `Translate into ${to === "ja" ? "Japanese" : "English"}:\n\n${text}`,
      },
    ],
  };

  try {
    const client = new Anthropic();

    let message;
    try {
      message = await client.beta.messages.create({
        ...request,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
    } catch (err) {
      // Older SDK or endpoint without server-side fallbacks: the plain call is
      // the same request minus the routing, so take it rather than fail.
      if (err && err.status === 400) {
        message = await client.messages.create(request);
      } else {
        throw err;
      }
    }

    if (message.stop_reason === "refusal") {
      return res.status(502).json({ error: "translation declined" });
    }

    const out = pickText(message).replace(/^["'「『]|["'」』]$/g, "").trim();
    if (!out) return res.status(502).json({ error: "empty translation" });

    return res.status(200).json({ text: out.slice(0, MAX_INPUT), to });
  } catch (err) {
    const status = err && err.status;
    if (status === 401 || status === 403) {
      console.error("translate: the Anthropic key was rejected");
      return res.status(503).json({ error: "translation not configured" });
    }
    if (status === 429) return res.status(429).json({ error: "rate limited" });
    console.error("translate handler failed:", err);
    return res.status(502).json({ error: "translation failed" });
  }
}
