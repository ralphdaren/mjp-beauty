---
name: verify
description: Build, run, and drive the MJP Beauty app to verify a change end-to-end (booking flows, admin dashboard, API routes).
---

# Verifying MJP Beauty

Vite + React SPA on the front, **Vercel serverless functions in `api/`** on the back,
Supabase (service-role only) + Square + Resend + Upstash behind that.

## Getting a handle

**`npm run dev` is vite-only — `/api/*` returns 404 under it.** Anything touching
`api/` must run under the Vercel CLI, which serves both:

```bash
vercel dev --listen 3010          # run in background; ~5s to "Ready! Available at"
```

Loads `.env` automatically (project is already linked; `.vercel/` is committed).
Wait on the log for `Ready! Available at` before driving.

**Gotcha:** `vercel dev` cold-compiles each function on its *first* invocation, so the
first hit of a route can take several seconds. Don't use fixed `waitForTimeout` after an
action that triggers a first-time route — `waitForSelector` on the expected result instead,
or you'll screenshot a still-loading panel and think the write failed.

## Routes

| Path | What |
|---|---|
| `/` `/book-appointment` | brow service booking (Square-backed) |
| `/in-person-training` | training booking drawer (Supabase-backed) |
| `/admin` | dashboard — Brow Services + In-Person Training categories |
| `/manage-booking?token=` | customer self-serve cancel |

## Auth

Admin is a bearer token — `ADMIN_SECRET` in `.env`, typed into the `/admin` password field
and sent as `Authorization: Bearer <secret>`. Pull it without printing it:

```bash
SECRET=$(grep '^ADMIN_SECRET=' .env | cut -d= -f2- | tr -d '"')
curl -s "http://localhost:3010/api/admin?resource=training-dates" -H "Authorization: Bearer $SECRET"
```

## Driving the UI

Playwright is in devDependencies. **The script must live inside the project dir** — ESM
resolves `playwright` from the importing file's location, so a script in a scratchpad
outside the repo fails with `ERR_MODULE_NOT_FOUND`. Write it to `.verify-tmp.mjs` at the
repo root and delete it after.

**Duplicate buttons:** pages render a desktop grid *and* a mobile carousel, so `Book Now`
etc. match multiple nodes, most hidden. Always use `:visible`:

```js
await pub.locator('button:has-text("Book Now"):visible').first().click()
```

## Rate limits will bite you

`api/_ratelimit.ts` is real Upstash Redis, enforced in dev too. `training-create` is
5/10min — a handful of probe requests exhausts it and subsequent probes return 429,
silently masking whatever you meant to test. Limits key on `X-Forwarded-For`, so spoof a
fresh IP per probe:

```bash
curl -H "X-Forwarded-For: 10.1.1.7" ...
```

## Training flow (Supabase)

Schema lives in `supabase/training-schema.sql` and must be applied in the Supabase SQL
editor. Verify it's live: `curl localhost:3010/api/training` → `{"dates":[...]}`; a 500
about a missing relation means it wasn't run.

Full loop worth driving: admin creates date → public drawer books a hold → seat decrements
→ admin **Confirm Payment** → hold moves to Confirmed and the seat stays taken.

**Always clean up test rows** — this hits the real Supabase project, not a local DB.
Deleting a `training_dates` row cascades to its bookings:

```bash
curl -s -X POST http://localhost:3010/api/admin -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{"resource":"training-dates","action":"delete","id":"<id>"}'
```

Use a unique marker (e.g. `location: "VerifyStudio-<ts>"`) so your rows are findable and
you never delete the client's real data.

## Don't

- Don't `npm run lint` as verification — it has pre-existing failures (`any` in
  `shopify.ts`, irregular whitespace in `OnlineBrowAcademyPage.tsx`) unrelated to any change.
- Emails go through real Resend and payments through real Square — don't drive those live.
