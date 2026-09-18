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

### 3. Set the edit password

Reading the board is always open — anyone with the link sees it. Changing it
needs a shared password. Add an environment variable in the Vercel project
(Settings → Environment Variables):

```
EDIT_PASSWORD = <the password your team shares>
```

Redeploy. The board now opens read-only for everyone, with an **Unlock to
edit** button in the top bar; entering the password turns on the add / drag /
edit controls and is remembered in that person's browser until they hit
**Unlocked** again to clear it.

Keep the password in Vercel only — never in this repository, and never in the
page source. To change it, edit the variable and redeploy; everyone is asked
for the new one the next time they save.

Leave `EDIT_PASSWORD` unset and the board is open to anyone with the link.

### 4. Optional: fill in the other language automatically

Every name on the board — projects and categories alike — is kept in English
and Japanese. With an Anthropic API key configured, typing one and leaving the
field fills in the other, and a button on each field translates on demand.

```
ANTHROPIC_API_KEY = <a key from console.anthropic.com>
```

Redeploy. Without the variable the feature simply isn't there: the buttons stay
hidden and both names are typed by hand. Translating is a write, so it needs
the edit password like everything else.

The endpoint is `api/translate.js`. It asks Claude for the label alone, holds
product and retailer names fixed, and caps the input at 200 characters, so a
call is a few hundred tokens.

## How it stores things

One Redis hash, `mirumi:items`, with one field per row holding that row as
JSON. Per-row fields mean two people editing different rows never overwrite
each other. Within a single row, the last save wins.

Categories live in the same hash under a `c__` prefix, so one command still
reads the whole board. A category is `{en, ja, color, sort}`, with `color` a
slot number from 1 to 8 that the page maps to a hex pair for light and dark.
They are written once, on the first request against a board that has none, and
belong to the board from then on.

Row order, and category order, are `sort` numbers. A move writes one record:
the moved one takes a value midway between its new neighbours. Only when that
gap closes up does the group get renumbered. `sort` is stored as a real number
for exactly this reason — rounding it to an integer would collapse the gaps
after a few moves.

`api/_seed.js` holds the board's starting contents. It is written to the
database once, on the first request against an empty store, and is never read
again after that — so editing that file does not change a board that is
already live.

### API

| Method | Path | Does |
|---|---|---|
| `GET` | `/api/items` | The whole board: `items`, `cats`, and `storage` |
| `POST` | `/api/items` | Create or replace one row (JSON body with `id`) |
| `DELETE` | `/api/items?id=…` | Remove one row |
| `POST` | `/api/cats` | Create or replace one category |
| `DELETE` | `/api/cats?id=…` | Remove a category, if it is empty and not the last |
| `POST` | `/api/translate` | `{text, to: "en" \| "ja"}` → `{text}`; 503 when no key is set |

A row is `{id, en, ja, cat, start, end, note_en, note_ja, sort}` and a category
is `{id, en, ja, color, sort}`. Dates are `YYYY-MM-DD`; `cat` is a category id.
The endpoints validate and truncate everything they are given, and cap the
board at 400 rows and 24 categories.

## Editing the timeline

- **Add** — "+ Add project" in the top bar. New rows join the bottom of their
  own category.
- **Move in time** — drag a bar sideways; drag either end to change just the
  start or just the end. Everything snaps to whole days.
- **Reorder** — drag a row's label up or down, or use the ↑ ↓ buttons beside
  it. Rows only move within their own category; to move one to a different
  category, change the category in the editor. Order is shared, not per
  person. On a phone the arrows are the way to do it, so that dragging a
  label still scrolls the page.

### Categories

Categories are the board's own structure, editable from the page rather than
from this repository.

- **Add** — "+ Category" in the top bar. New ones join the bottom and take the
  first unused colour.
- **Rename and recolour** — the ✎ on a category header. Both languages are
  edited together, and the colour is one of eight slots (see below).
- **Reorder** — the ↑ ↓ on a category header. The group and its rows move
  together.
- **Delete** — the ✎, then Delete. A category holding projects can't be
  deleted, and neither can the last one; move its projects elsewhere first.

An empty category keeps its header so you can still rename, move or remove it.

Colours come from a fixed eight-slot palette chosen so that neighbouring
groups stay distinguishable in both themes and under the common forms of
colour blindness. Two categories may share a slot if you pick the same one
twice — the group header and the label on every bar still say which is which.
- **Edit** — click a bar, or the pencil in the row label, for names in both
  languages, category, dates and a note.
- **Filter** — click a colour chip in the legend to hide that category. The
  choice is remembered per person, not shared.
- **Language** — EN / 日本語 in the top right, also remembered per person.
- **Translate** — with a key configured (step 4), leaving a name field fills
  the other language if it is still empty or was itself translated. Anything
  typed by hand is never overwritten; the button on each field translates over
  it when you do want that.

Key commercial dates (Halloween, Thanksgiving, Black Friday, Cyber Monday, the
ground-shipping cutoff, Christmas) are drawn as marked lines and shaded bands.
They live in `MOMENTS` near the top of the script in `index.html`. Categories
are no longer in the source — they are edited on the page.

## Running it locally

`vercel dev` in this directory, with `KV_REST_API_URL` and `KV_REST_API_TOKEN`
in a `.env.local` file. Without them the API serves the starting rows read-only,
which is enough to work on the layout.
