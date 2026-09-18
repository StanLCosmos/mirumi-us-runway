import {
  KEY,
  ID_RE,
  authorized,
  cleanRow,
  credentials,
  locked,
  readBoard,
  redis,
  seedBoard,
} from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const creds = credentials();
  if (!creds) {
    // Deployed but no database attached yet: serve the starting board read-only
    // so the page is never blank, and let the page say edits won't persist.
    if (req.method === "GET") {
      return res.status(200).json({
        storage: "none",
        locked: locked(),
        unlocked: false,
        translate: false,
        ...seedBoard(),
      });
    }
    return res.status(503).json({ error: "no database connected" });
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        storage: "kv",
        locked: locked(),
        unlocked: authorized(req),
        // The page hides its translate buttons when no key is configured.
        translate: Boolean(process.env.ANTHROPIC_API_KEY),
        ...(await readBoard(creds)),
      });
    }

    if (req.method === "POST" || req.method === "PUT") {
      if (!authorized(req)) return res.status(401).json({ error: "edit password required" });
      const input = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const parsed = cleanRow(input);
      if (!parsed) return res.status(400).json({ error: "invalid row" });
      const exists = await redis(creds, ["HEXISTS", KEY, parsed.id]);
      if (!exists) {
        const count = await redis(creds, ["HLEN", KEY]);
        if (count >= 400) return res.status(409).json({ error: "board is full" });
      }
      await redis(creds, ["HSET", KEY, parsed.id, JSON.stringify(parsed.row)]);
      return res.status(200).json({ ok: true, id: parsed.id });
    }

    if (req.method === "DELETE") {
      if (!authorized(req)) return res.status(401).json({ error: "edit password required" });
      const id = String((req.query && req.query.id) || "").trim();
      if (!ID_RE.test(id)) return res.status(400).json({ error: "invalid id" });
      await redis(creds, ["HDEL", KEY, id]);
      return res.status(200).json({ ok: true, id });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("items handler failed:", err);
    return res.status(500).json({ error: "storage unavailable" });
  }
}
