# mirumi US Runway

A shared, bilingual (EN / 日本語) Gantt board for the mirumi US launch — supply,
warehouse, pop-ups, online store and compliance, plotted against Halloween,
Black Friday and Christmas.

Anyone who opens the link can add rows, rename them, and drag bars to change
dates. Edits are saved server-side and show up for everyone else within about
five seconds. No sign-in.

## Deploying

### 1. Import the repository into Vercel

At [vercel.com/new](https://vercel.com/new), pick this repository and deploy.
There is no build step and there are no dependencies — Vercel serves
`index.html` and runs `api/items.js` as a serverless function.

The first deploy already works: the board renders with its starting contents,
and a banner says edits will not be saved until a database is attached.

### 2. Attach a database

In the Vercel project: **Storage → Create Database → Upstash for Redis**, then
connect it to the project. Vercel injects `KV_REST_API_URL` and
`KV_REST_API_TOKEN` automatically.

Redeploy once so the function picks up the new environment variables. The
banner changes to "Live — anyone with the link can edit", and the board seeds
itself with the starting rows on the first request.

That is the whole setup. Send people the deployment URL.

### 3. Optional: an edit password

Anyone who has the URL can edit the board, including deleting rows. To require
a shared password for writes (reading stays open), add an environment variable
in Vercel:

```
EDIT_PASSWORD = <whatever you choose>
```

The page asks for it the first time someone saves a change and remembers it in
that person's browser. Leave the variable unset for a fully open board.

## How it stores things

One Redis hash, `mirumi:items`, with one field per row holding that row as
JSON. Per-row fields mean two people editing different rows never overwrite
each other. Within a single row, the last save wins.

`api/_seed.js` holds the board's starting contents. It is written to the
database once, on the first request against an empty store, and is never read
again after that — so editing that file does not change a board that is
already live.

### API

| Method | Path | Does |
|---|---|---|
| `GET` | `/api/items` | All rows, plus `storage: "kv"` or `"none"` |
| `POST` | `/api/items` | Create or replace one row (JSON body with `id`) |
| `DELETE` | `/api/items?id=…` | Remove one row |

A row is `{id, en, ja, cat, start, end, note_en, note_ja, sort}`. Dates are
`YYYY-MM-DD`. `cat` is one of `supply`, `warehouse`, `design`, `popup`, `ec`,
`comply`. The endpoint validates and truncates everything it is given, and caps
the board at 400 rows.

## Editing the timeline

- **Add** — "+ Add project" in the top bar.
- **Move** — drag a bar sideways; drag either end to change just the start or
  just the end. Everything snaps to whole days.
- **Edit** — click a bar, or the pencil in the row label, for names in both
  languages, category, dates and a note.
- **Filter** — click a colour chip in the legend to hide that category. The
  choice is remembered per person, not shared.
- **Language** — EN / 日本語 in the top right, also remembered per person.

Key commercial dates (Halloween, Thanksgiving, Black Friday, Cyber Monday, the
ground-shipping cutoff, Christmas) are drawn as marked lines and shaded bands.
They live in `MOMENTS` near the top of the script in `index.html`, alongside
`CATS` if you want to change the categories.

## Running it locally

`vercel dev` in this directory, with `KV_REST_API_URL` and `KV_REST_API_TOKEN`
in a `.env.local` file. Without them the API serves the starting rows read-only,
which is enough to work on the layout.
