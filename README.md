# CareerQuest web (Phase 2 prototype)

A clickable React app built from `../specs/designFlow.md` and the Phase 2 spec. Mobile-first (360 px), expanding to a left-rail layout on wide screens.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/ (about 138 KB gzipped)
```

Needs Node 18+. Stack: Vite, React 18, react-router (hash routes), zustand, supabase-js. No UI or animation libraries, so it stays light on low-end phones.

## Supabase setup

Content (careers, specialisations, per-field sources and dates, roadmaps, ladders, quiz) and the review queue live in Supabase Postgres. Student data (XP, badges, shortlist, quiz answers, progress) still stays on the student's device in this phase. Without Supabase configured the app runs on its bundled sample data, so nothing breaks.

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

Sign in at `#/admin`. Only accounts with this role can see reports or change content; the database enforces it, not the screen. Also turn off Authentication > Sign In / Providers > "Allow new users to sign up", because students do not use accounts yet.

**Editing content.** Use the Table Editor. Students see changes on their next load. When you change a number, also update that row's `last_updated`, or the "may be outdated" tag will lie. Approving a change in the review queue does both for you.

**Re-seeding.** `npm run db:seed` regenerates `../supabase/seed.sql` from `src/data/`. Running that SQL resets every seeded career, field, roadmap, ladder and quiz row to the bundled sample data, so run it only for a fresh start. It never undoes a reviewer's decision.

**What the public key can do.** Read content, file an error report, and check on its own reports (by their secret id). It cannot read other reports, edit content or review anything. Reports have no rate limit yet: add one (an Edge Function or a captcha) before launch.

**What is not in the database.** XP rules, level thresholds and badge rules stay in code (`src/lib/config.js`, `src/lib/badges.js`) because they are logic, not content.

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
| Phone OTP, Google and email sign-in, guardian consent, sync | **Simulated.** Any 6-digit code works, and "Demo: simulate guardian approval" is on the Me tab |
| Content and review queue | **Supabase** when configured (see above): loaded in one request, cached on the device for offline use, bundled sample data as the last fallback. Error reports upload when online and the app checks back for the reviewer's decision, so Fact Checker comes from a real review |
| Student data (XP, badges, shortlist, progress) | `localStorage` on this device only. Accounts and syncing are the next step |
| Offline | Offline banner and queued step completion, via Settings > Demo tools > Simulate offline. There is no service worker yet, so a hard reload offline will not work |
| Career data, sources and roadmaps | **Illustrative samples.** Replace with reviewed, sourced data before any real use |

## Where things live

```
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
