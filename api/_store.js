import { timingSafeEqual } from "node:crypto";

import { SEED } from "./_seed.js";

// One Redis hash holds the whole board. Rows live under their own id; a
// category lives under CAT_PREFIX + its id. Keeping both in one hash means a
// page load reads everything in a single command, and a field per record means
// two people editing different things never overwrite each other.
export const KEY = "mirumi:items";
const SEEDED = "mirumi:seeded";
const CAT_PREFIX = "c__";

export const ROW_FIELDS = ["en", "ja", "cat", "start", "end", "note_en", "note_ja", "sort"];
export const CAT_FIELDS = ["en", "ja", "color", "sort"];
export const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Slots in the chart palette. Colours are named by slot, not by hex, so the
// page owns how each slot looks in light and dark.
export const PALETTE_SLOTS = 8;

// Written once, when the store holds no categories at all.
export const DEFAULT_CATS = [
  { id: "supply", en: "Supply & Shipping", ja: "生産・輸送", color: 1, sort: 10 },
  { id: "warehouse", en: "Warehouse & Logistics", ja: "倉庫・物流", color: 2, sort: 20 },
  { id: "design", en: "Design & Build", ja: "デザイン・制作", color: 3, sort: 30 },
  { id: "popup", en: "Retail Pop-up", ja: "店頭ポップアップ", color: 4, sort: 40 },
  { id: "ec", en: "Online Store", ja: "オンラインストア", color: 5, sort: 50 },
  { id: "comply", en: "Compliance & Ops", ja: "認証・体制", color: 6, sort: 60 },
];

export function credentials() {
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

export async function redis(creds, command) {
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

export const catField = (id) => CAT_PREFIX + id;

// Reading is always open. Writing needs the shared password, when one is set.
export function locked() {
  return Boolean(process.env.EDIT_PASSWORD);
}

export function authorized(req) {
  const expected = process.env.EDIT_PASSWORD;
  if (!expected) return true; // no password set: anyone with the link can edit
  const given = req.headers["x-edit-key"];
  if (typeof given !== "string") return false;
  // Compare over a fixed width so a wrong guess takes the same time as a
  // right one, and length alone never leaks.
  const a = Buffer.alloc(64);
  const b = Buffer.alloc(64);
  a.write(String(given).slice(0, 64));
  b.write(expected.slice(0, 64));
  return timingSafeEqual(a, b) && given.length === expected.length;
}

const text = (v, max) => String(v == null ? "" : v).slice(0, max);

// Accept only the shape the page renders. Anyone with the link can write here,
// so nothing reaches the store unvalidated or unbounded.
export function cleanRow(input) {
  const id = String(input.id || "").trim();
  if (!ID_RE.test(id) || id.startsWith(CAT_PREFIX)) return null;

  const row = {
    en: text(input.en, 200),
    ja: text(input.ja, 200),
    cat: ID_RE.test(String(input.cat || "")) ? String(input.cat) : null,
    start: DATE_RE.test(input.start) ? input.start : null,
    end: DATE_RE.test(input.end) ? input.end : null,
    note_en: text(input.note_en, 1000),
    note_ja: text(input.note_ja, 1000),
    // Fractional on purpose: a reorder drops the moved record midway between
    // its neighbours, which only works if the fraction survives the round trip.
    sort: Number.isFinite(+input.sort) ? +input.sort : 0,
  };
  if (!row.en && !row.ja) return null;
  if (!row.cat) return null;
  if (!row.start) return null;
  if (!row.end || row.end < row.start) row.end = row.start;
  return { id, row };
}

export function cleanCat(input) {
  const id = String(input.id || "").trim();
  if (!ID_RE.test(id)) return null;

  const en = text(input.en, 80);
  const ja = text(input.ja, 80);
  if (!en && !ja) return null;

  let color = Math.trunc(+input.color);
  if (!Number.isFinite(color) || color < 1 || color > PALETTE_SLOTS) color = 1;

  return {
    id,
    row: {
      en: en || ja,
      ja: ja || en,
      color,
      sort: Number.isFinite(+input.sort) ? +input.sort : 0,
    },
  };
}

// Each warm function instance checks the seed flag once, not once per request.
// Reads are the hot path and the free tier bills per command.
let seedChecked = false;

export async function readBoard(creds) {
  if (!seedChecked) {
    const seeded = await redis(creds, ["EXISTS", SEEDED]);
    if (!seeded) {
      const command = ["HSET", KEY];
      for (const [id, row] of Object.entries(SEED)) command.push(id, JSON.stringify(row));
      await redis(creds, command);
      await redis(creds, ["SET", SEEDED, "1"]);
    }
    seedChecked = true;
  }

  // HGETALL comes back as a flat [field, value, field, value, ...] array.
  const flat = (await redis(creds, ["HGETALL", KEY])) || [];
  const items = [];
  const cats = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const field = flat[i];
    let value;
    try {
      value = JSON.parse(flat[i + 1]);
    } catch {
      continue; // a record that isn't JSON is one we can't render
    }
    if (field.startsWith(CAT_PREFIX)) {
      const c = { id: field.slice(CAT_PREFIX.length) };
      for (const f of CAT_FIELDS) c[f] = value[f];
      cats.push(c);
    } else {
      const r = { id: field };
      for (const f of ROW_FIELDS) r[f] = value[f];
      items.push(r);
    }
  }

  // A board carried over from before categories were editable has rows but no
  // category records. Write the defaults once, then leave them alone forever.
  if (!cats.length) {
    const command = ["HSET", KEY];
    for (const c of DEFAULT_CATS) {
      const { id, ...body } = c;
      command.push(catField(id), JSON.stringify(body));
      cats.push({ ...c });
    }
    await redis(creds, command);
  }

  items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  cats.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  return { items, cats };
}

export function seedBoard() {
  return {
    items: Object.entries(SEED).map(([id, row]) => ({ id, ...row })),
    cats: DEFAULT_CATS.map((c) => ({ ...c })),
  };
}
