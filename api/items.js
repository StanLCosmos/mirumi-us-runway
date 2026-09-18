import { SEED } from "./_seed.js";

// One Redis hash holds the board: field = row id, value = the row as JSON.
// Per-row fields mean two people editing different rows never overwrite
// each other, which a single whole-document blob would not give us.
const KEY = "mirumi:items";
const SEEDED = "mirumi:seeded";

const FIELDS = ["en", "ja", "cat", "start", "end", "note_en", "note_ja", "sort"];
const CATS = ["supply", "warehouse", "design", "popup", "ec", "comply"];
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function credentials() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

async function redis(creds, command) {
  const res = await fetch(creds.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`redis ${res.status}: ${text.slice(0, 300)}`);
  const body = JSON.parse(text);
  if (body.error) throw new Error(`redis: ${body.error}`);
  return body.result;
}

// Accept only the shape the page renders. Anyone with the link can write here,
// so nothing reaches the store unvalidated or unbounded.
function clean(input) {
  const id = String(input.id || "").trim();
  if (!ID_RE.test(id)) return null;

  const text = (v, max) => String(v == null ? "" : v).slice(0, max);
  const row = {
    en: text(input.en, 200),
    ja: text(input.ja, 200),
    cat: CATS.includes(input.cat) ? input.cat : "popup",
    start: DATE_RE.test(input.start) ? input.start : null,
    end: DATE_RE.test(input.end) ? input.end : null,
    note_en: text(input.note_en, 1000),
    note_ja: text(input.note_ja, 1000),
    sort: Number.isFinite(+input.sort) ? Math.trunc(+input.sort) : 0,
  };
  if (!row.en && !row.ja) return null;
  if (!row.start) return null;
  if (!row.end || row.end < row.start) row.end = row.start;
  return { id, row };
}

function authorized(req) {
  const expected = process.env.EDIT_PASSWORD;
  if (!expected) return true; // no password set: anyone with the link can edit
  const given = req.headers["x-edit-key"];
  return typeof given === "string" && given === expected;
}

async function readAll(creds) {
  const seeded = await redis(creds, ["EXISTS", SEEDED]);
  if (!seeded) {
    const command = ["HSET", KEY];
    for (const [id, row] of Object.entries(SEED)) command.push(id, JSON.stringify(row));
    await redis(creds, command);
    await redis(creds, ["SET", SEEDED, "1"]);
  }
  // HGETALL comes back as a flat [field, value, field, value, ...] array.
  const flat = (await redis(creds, ["HGETALL", KEY])) || [];
  const items = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    try {
      const row = JSON.parse(flat[i + 1]);
      const picked = { id: flat[i] };
      for (const f of FIELDS) picked[f] = row[f];
      items.push(picked);
    } catch {
      // a row that isn't JSON is a row we can't render; skip it
    }
  }
  items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return items;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const creds = credentials();
  if (!creds) {
    // Deployed but no database attached yet: serve the starting board read-only
    // so the page is never blank, and let the page say edits won't persist.
    if (req.method === "GET") {
      const items = Object.entries(SEED).map(([id, row]) => ({ id, ...row }));
      return res.status(200).json({ storage: "none", items });
    }
    return res.status(503).json({ error: "no database connected" });
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({ storage: "kv", items: await readAll(creds) });
    }

    if (req.method === "POST" || req.method === "PUT") {
      if (!authorized(req)) return res.status(401).json({ error: "edit password required" });
      const input = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const parsed = clean(input);
      if (!parsed) return res.status(400).json({ error: "invalid row" });
      const count = await redis(creds, ["HLEN", KEY]);
      const exists = await redis(creds, ["HEXISTS", KEY, parsed.id]);
      if (!exists && count >= 400) return res.status(409).json({ error: "board is full" });
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
