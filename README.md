# CareerQuest web (Phase 2 prototype)

A clickable React app built from `../specs/designFlow.md` and the Phase 2 spec. Mobile-first (360 px), expanding to a left-rail layout on wide screens.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/ (about 138 KB gzipped)
```

Needs Node 18+. Stack: Vite, React 18, react-router (hash routes), zustand, supabase-js. No UI or animation libraries, so it stays light on low-end phones.

## Supabase setup

Content (careers, specialisations, per-field sources and dates, roadmaps, ladders, quiz) and the review queue live in Supabase Postgres. Guests keep their progress on their device. Students who sign in with Google get an account, and their progress follows them across devices (see "Student accounts" below). Without Supabase configured the app runs on its bundled sample data, so nothing breaks.

**1. Create the tables.** Supabase dashboard > SQL Editor > New query. Paste all of `../supabase/migrations/0001_content.sql` and run it. Then do the same with `../supabase/seed.sql` (about 260 KB; if the editor struggles, run it one section at a time, the sections are marked with comments). Both are safe to run twice.

**2. Connect the app.** Dashboard > Project Settings > API. Copy the Project URL and the `anon` (publishable) key into `web/.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev` (Vite reads env files only at startup). Never use the `service_role` / secret key here: it would ship to every student's browser. The app refuses to start with one.

**3. Check it worked.** Open Settings > Demo tools: "Content source" should say **Supabase (live)**. If it says "Bundled sample data (Supabase unreachable)", the line below it gives the reason.

**4. Create a reviewer.** Authentication > Users > Add user (email and password, tick auto-confirm). Then in the SQL Editor:

```sql
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
 where email = 'you@example.com';
```

Sign in at `#/admin`. Only accounts with this role can see reports or change content; the database enforces it, not the screen. Leave "Allow new users to sign up" ON: it applies to every provider, so turning it off would also stop students signing in with Google. Accounts made directly with an email address can still be created through the public API, but they cannot create a profile or save anything: the database only accepts Google sign-ins for students.

**Editing content.** Use the Table Editor. Students see changes on their next load. When you change a number, also update that row's `last_updated`, or the "may be outdated" tag will lie. Approving a change in the review queue does both for you.

**Re-seeding.** `npm run db:seed` regenerates `../supabase/seed.sql` from `src/data/`. Running that SQL resets every seeded career, field, roadmap, ladder and quiz row to the bundled sample data, so run it only for a fresh start. It never undoes a reviewer's decision.

**What the public key can do.** Read content, file an error report, and check on its own reports (by their secret id). It cannot read other reports, edit content or review anything. Reports have no rate limit yet: add one (an Edge Function or a captcha) before launch.

**What is not in the database.** XP rules, level thresholds and badge rules stay in code (`src/lib/config.js`, `src/lib/badges.js`) because they are logic, not content.

## Student accounts (Google sign-in)

Students can explore as guests, or sign in with **Google** to keep their progress across devices. There is no phone or email sign-in. Guest mode stays: it is a spec requirement, and it is what keeps under-18 students from being blocked at the door.

**How it behaves**

- Signing in asks for a nickname and class only (no real name; the Google name and email are never shown or stored in the profile). Under 18 is decided by class (11 and 12) or, for "Other", by a date of birth that is used once and **never stored**.
- Progress made as a guest is offered for merging on first sign-in ("Add to my account" or "Start fresh"). Two devices merge automatically without losing anything: XP keeps the larger value, badges and opened roles are combined, and the shortlist and roadmap steps merge three ways so a removal on one device is not undone by the other.
- **Under 18:** nothing is saved to the server until a parent or guardian approves. The student shares a link (WhatsApp, copy or the share sheet); the guardian opens it without signing in, reads what is collected, enters their name, and approves. They can withdraw with the same link, which erases the saved progress. This is enforced in the database (`can_sync`), not just on screen.
- Signing out removes the student's progress from the device (it lives in the account), and warns first if anything has not finished saving. Deleting the account removes the sign-in itself, and everything attached to it, on the server.
- All of this sits behind database functions that check who is calling. The account tables have no direct access at all.

**Interim consent, and what it does not do.** The guardian link does not verify who the guardian is. It records their name, the time and the wording version they agreed to. Under the DPDP Act 2023, consent for under-18s must be verifiable, so have legal review this flow before real students use it.

**Set it up** (about 10 minutes; this is the part only you can do)

1. **Run the migration.** SQL Editor, paste all of `../supabase/migrations/0003_accounts.sql`, run it.
2. **Create the Google credentials.** [Google Cloud Console](https://console.cloud.google.com) > create or pick a project > *Google Auth Platform* (or *APIs and Services > OAuth consent screen*). Set the app name and a support email, choose **External**, and add your own email as a developer contact. Then *Clients > Create client > Web application*:
   - **Authorized JavaScript origins:** your Vercel URL (`https://your-app.vercel.app`), and `http://localhost:5173` for local development.
   - **Authorized redirect URIs:** Supabase's callback, which is `https://<project-ref>.supabase.co/auth/v1/callback` (copy it from the Supabase Google provider page, step 3).
   - Copy the **Client ID** and **Client secret**.
   - Under the consent screen, publish the app (**In production**). While it is in *Testing*, only the test users you list can sign in. The basic scopes used here (email, profile, openid) do not need Google's verification review.
3. **Turn on the provider in Supabase.** Authentication > Sign In / Providers > Google > enable, paste the Client ID and secret, save.
4. **Tell Supabase where the app lives.** Authentication > URL Configuration: set **Site URL** to your Vercel URL, and add these under **Redirect URLs**: `https://your-app.vercel.app/` and `http://localhost:5173/` (the trailing slash matters; for Vercel preview deployments add `https://*-<your-team>.vercel.app/`).
5. **Check it.** Open the app, tap *Continue with Google*, pick an account, choose a nickname and class. In the SQL Editor, `select nickname, class_stage, is_minor, consent_status from profiles;` should show the new row. With no Supabase configured the Google button is not shown at all.

**If something goes wrong**

| You see | Likely cause |
|---|---|
| Google says `redirect_uri_mismatch` | The redirect URI in Google Cloud is not exactly Supabase's `/auth/v1/callback` address |
| A page of JSON with `provider is not enabled` | Step 3 is not done |
| Back at the app but still not signed in | The app's address is missing from Supabase *Redirect URLs* (step 4) |
| Google says the app is not verified or blocked | The consent screen is still in *Testing*: publish it, or add the person as a test user |
| A school Google account cannot sign in | Many school Workspace accounts block third-party sign-in. Those students can use a personal account, or keep exploring as guests |

**Privacy to mention to legal.** Supabase stores the Google account's email and name in its sign-in system (needed to sign someone in). Our own tables hold only the nickname, class, optional state, the progress document, and the guardian's name and approval time. XP is not tamper-proof (it is kept in a document the student's device writes), which is acceptable only because nothing has a leaderboard, prize or payment tied to it.

## Role finder chat

Students describe what they want in their own words ("good at maths, want 20 lakh a year") at `#/chat` and get roles from our data, with links. It works in three tiers, so it never dead-ends:

1. **Assistant mode:** an Edge Function (`role-chat`) has a model turn the message into filters, plain code retrieves and ranks roles, then the model words short explanations from those facts only.
2. **Keyword mode on the server:** used when the free model quota is spent or every model fails.
3. **Keyword mode on the device:** used offline, when the function is unreachable, or when the student chooses "Quick match only" (nothing they type leaves the device).

The matching engine is one file, `src/lib/match.js`, shared by the quiz, the device and the function. Rules that hold in every tier:

- Only roles that exist in the content can appear. Links are built by the app from ids, never taken from model text.
- Any model sentence containing a number that is not in the retrieved facts is replaced by a template.
- Pay is a **filter**, never the ranking. Results are ordered by fit, then roles whose pay *typically* reaches the target before ones where only the top of the range does, then sooner before later. Each card shows starting pay beside the level where pay reaches the target and how long that usually takes.
- Phone numbers, emails and links are stripped on the device and again on the server. There is no slot for caste, religion, gender or family income, so a model cannot return them.

**To turn the assistant on** (until you do, the chat runs in keyword mode):

1. Run `../supabase/migrations/0002_chat.sql` in the SQL Editor (quota counters and the review log).
2. Get a model key. Groq (console.groq.com) is a good first choice; OpenRouter works too. Avoid free tiers whose terms let the provider train on prompts, because students are minors.
3. Dashboard > Edge Functions > Create function named `role-chat`, paste the whole of `../supabase/functions/role-chat/index.ts`, and deploy. Leave "Verify JWT" on (your anon key is a JWT). If you move to the newer publishable keys, turn it off for this function.
4. Dashboard > Edge Functions > Secrets: add `GROQ_API_KEY` (and optionally `OPENROUTER_API_KEY`). Optional: `GROQ_MODEL`, `OPENROUTER_MODEL` (model names change, so check the provider's list), `CHAT_DEVICE_DAILY_CAP` (default 30), `CHAT_GLOBAL_DAILY_CAP` (default 400), `ALLOWED_ORIGIN`.
5. Open `#/chat`, choose "Use the assistant", and ask something. Check Edge Functions > Logs, and `select * from chat_log order by created_at desc;` in the SQL Editor.

**LiteLLM:** set `LLM_BASE_URL`, `LLM_API_KEY` and `LLM_MODEL` to point the function at a LiteLLM proxy. It is tried first. You do not need it to start.

**Capacity:** one assistant turn is one quota unit and two model requests. With the default caps that is at most 800 requests a day, which fits a free tier of about 1,000 a day (verify the provider's current limit). When the cap is hit, students get keyword matches and a calm note.

**After changing `functions/role-chat.js` or `src/lib/match.js`:** run `npm run build:fn` and paste the regenerated file again.

**Before launch:** have legal review the consent text and the model provider's data terms (DPDP, minors). Keep the log only as long as review needs it: `select public.purge_chat_log(90);` deletes entries older than 90 days (run it now and then, or schedule it with pg_cron). Review a sample of `chat_log` for biased or wrong answers, as the spec requires.

## What is real and what is simulated

| Area | Status |
|---|---|
| XP rules, daily cap (150), per-action caps, levels, badges, level-up and badge queues | Real, driven by `src/lib/config.js` and `src/store.js` |
| Quiz (9 questions, resumable, editable) and rule-based recommender | Real. The AI step is a stub: `QuizRun.finish()` is where a grounded model call goes, with the rule-based matcher as the fallback |
| Per-field source and `last_updated`, 90-day "May be outdated" tag, info sheet, error reports, review queue (`#/admin`) | Real. Approving a change applies it with today's date; approving a student report awards Fact Checker |
| Careers: 16 top-level roles (8 in Tech) and 24 specialisations (Doctor has 8, including Dentist, which is a separate BDS degree) | Real. Specialisations are full cards linked to a parent. Browsing shows top-level roles, search finds everything, and the quiz recommends top-level roles only |
| Roadmaps (37, with alternate paths, start-stage switch, step progress) | Real. A specialisation's roadmap extends its parent's steps. Physiotherapist, Financial Analyst and HR Manager show "Roadmap coming soon" |
| Career ladders (18 own, shared by every specialisation that doesn't have its own): levels with typical time, pay (own source and date), what you do, skills and how to move up, with tracks where careers fork | Real. Route `#/career/:id/ladder`. Entry points are the career card, the end of each roadmap and a Growth path row in Compare. No XP is attached, since the XP table in the spec is fixed |
| Role finder chat (assistant mode, keyword fallbacks, quota, review log) | Real code, tested against a mock model. **Not live until you deploy the function and add a model key** (above). Until then it runs in keyword mode |
| Guest mode, shortlist, compare (never sorted or highlighted by pay), share-as-image | Real |
| Google sign-in, profile, progress sync across devices, under-18 guardian link, sign-out, delete account | Real code, tested end to end against the real SQL (see Tests). **Not live until you do the Google setup above.** Guardian consent is an interim self-service flow, not verified consent |
| Content and review queue | **Supabase** when configured (see above): loaded in one request, cached on the device for offline use, bundled sample data as the last fallback. Error reports upload when online and the app checks back for the reviewer's decision, so Fact Checker comes from a real review |
| Student data (XP, badges, shortlist, progress) | Guests: `localStorage` on the device. Signed-in students: also saved to their account (one JSON document per student), merged across devices |
| Offline | Offline banner and queued step completion, via Settings > Demo tools > Simulate offline. There is no service worker yet, so a hard reload offline will not work |
| Career data, sources and roadmaps | Entry **salary and entry exam** for all 40 roles were checked once (30 Oct 2026) against named public sources, listed in `src/data/verified.js` (mainly Payscale India averages, ICAI, NTA, IIT Bombay UCEED). Everything else (study length, cost, demand, growth-path pay, roadmap steps) is an **editorial estimate** and the ⓘ sheet says so. Students see one review date in Me > About the data, not a date per figure. After re-checking, update `verified.js` and `REVIEWED_ON`, run `npm run db:seed`, and re-run the seed in Supabase |

## Tests

Kept in `../tests/` with their own dependencies, so they never touch this app's build. They run real SQL in an in-memory Postgres (PGlite) and drive the app in a real browser (Playwright):

```bash
cd ../tests && npm install && npx playwright install chromium
node sql-accounts.mjs   # accounts, consent and deletion rules in the database (63 checks)
node sync.mjs           # the progress merge (31 checks)
# build the two test apps (commands are at the top of auth.mjs), then:
node auth.mjs           # Google sign-in, profile, sync, two devices, guardian flow, delete (31 checks)
node smoke.mjs          # the guest experience still works (12 checks)
```

## Where things live

```
src/lib/account.js     Google sign-in, profile, guardian consent, sync
src/lib/sync.js        which progress is saved to an account, and how copies are merged
src/lib/config.js      XP table, daily cap, level thresholds (the one place to rebalance)
src/lib/badges.js      15 badges with unlock rules and hints
src/lib/recommend.js   quiz recommender; guarantees one role outside the student's stream
src/lib/match.js       shared matching engine (quiz, device chat, Edge Function)
src/lib/chat.js        chat client: function call with on-device fallback
functions/role-chat.js Edge Function source; `npm run build:fn` bundles it to ../supabase/functions/role-chat/index.ts
src/data/              careers + specialisations (per-field source and date), roadmaps, career ladders, quiz, admin queue seed
src/store.js           all state and the XP engine
src/content/           loads content from Supabase (cache + fallback) and maps rows to app shapes
src/lib/supabase.js    the client (refuses a service-role key)
../supabase/           migration and generated seed SQL
src/pages/             one file per screen (S1 to S24 in the design flow)
```

Analytics events from the design flow are logged through `src/lib/analytics.js`. View them in Settings > Demo tools.
