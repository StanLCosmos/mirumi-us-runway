import {
  KEY,
  ID_RE,
  authorized,
  catField,
  cleanCat,
  credentials,
  readBoard,
  redis,
} from "./_store.js";

// Categories are the board's own structure, so there is a floor of one: the
// last category can't be removed, and one still holding projects can't either.
const MAX_CATS = 24;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const creds = credentials();
  if (!creds) return res.status(503).json({ error: "no database connected" });
  if (!authorized(req)) return res.status(401).json({ error: "edit password required" });

  try {
    if (req.method === "POST" || req.method === "PUT") {
      const input = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const parsed = cleanCat(input);
      if (!parsed) return res.status(400).json({ error: "invalid category" });

      const exists = await redis(creds, ["HEXISTS", KEY, catField(parsed.id)]);
      if (!exists) {
        const { cats } = await readBoard(creds);
        if (cats.length >= MAX_CATS) return res.status(409).json({ error: "too many categories" });
      }
      await redis(creds, ["HSET", KEY, catField(parsed.id), JSON.stringify(parsed.row)]);
      return res.status(200).json({ ok: true, id: parsed.id });
    }

    if (req.method === "DELETE") {
      const id = String((req.query && req.query.id) || "").trim();
      if (!ID_RE.test(id)) return res.status(400).json({ error: "invalid id" });

      const { items, cats } = await readBoard(creds);
      if (!cats.some((c) => c.id === id)) return res.status(200).json({ ok: true, id });
      if (cats.length <= 1) return res.status(409).json({ error: "last category" });

      const used = items.filter((r) => r.cat === id).length;
      if (used) return res.status(409).json({ error: "category not empty", rows: used });

      await redis(creds, ["HDEL", KEY, catField(id)]);
      return res.status(200).json({ ok: true, id });
    }

    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("cats handler failed:", err);
    return res.status(500).json({ error: "storage unavailable" });
  }
}
