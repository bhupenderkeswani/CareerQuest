// Generates ../supabase/seed.sql from the bundled content in src/data/.
//   npm run db:seed
// The bundled data is the seed. Once the database is seeded, edit content there (Supabase Table
// Editor); re-running the seed resets every seeded row back to what is in src/data/.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, '../supabase/seed.sql');
const tmp = join(root, 'scripts/.tmp');
mkdirSync(tmp, { recursive: true });

// Bundle the data modules (they use extensionless ESM imports) so plain Node can load them.
await build({
  stdin: {
    contents: `
      export { CAREERS } from './src/data/careers.js';
      export { ROADMAPS } from './src/data/roadmaps.js';
      export { LADDERS } from './src/data/ladders.js';
      export { QUESTIONS, quizMeta } from './src/data/quiz.js';
      export { SEED_QUEUE } from './src/data/admin.js';
    `,
    resolveDir: root,
  },
  bundle: true, platform: 'node', format: 'esm', outfile: join(tmp, 'content.mjs'), logLevel: 'error',
});
const { CAREERS, ROADMAPS, LADDERS, QUESTIONS, quizMeta, SEED_QUEUE } = await import(pathToFileURL(join(tmp, 'content.mjs')).href);

// ---------- SQL literal helpers ----------
const str = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null ? 'NULL' : String(Number(v)));
const json = (v) => (v == null ? 'NULL' : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`);
const bool = (v) => (v ? 'true' : 'false');
const now = Date.now();
const ago = (iso) => `now() - interval '${Math.max(0, Math.round((now - new Date(iso).getTime()) / 864e5))} days'`;
const rows = (list) => list.map((r) => `  (${r.join(', ')})`).join(',\n');

function insert(table, cols, list, conflict, update) {
  if (!list.length) return '';
  const set = update.length ? `do update set ${update.map((c) => `${c} = excluded.${c}`).join(', ')}` : 'do nothing';
  return `insert into public.${table} (${cols.join(', ')}) values\n${rows(list)}\non conflict (${conflict.join(', ')}) ${set};\n`;
}

const parts = [];
const section = (title, sql) => parts.push(`-- ${title}\n${sql}`);

// Parents first so the foreign key is satisfied; position keeps the app's display order.
const byId = Object.fromEntries(CAREERS.map((c) => [c.id, c]));
const ordered = [...CAREERS.filter((c) => !c.parent), ...CAREERS.filter((c) => c.parent)];
section('Careers and specialisations', insert('careers',
  ['id', 'parent_id', 'name', 'field', 'emoji', 'hue', 'tagline', 'tags', 'check_note', 'daily_quest', 'side_quests', 'position'],
  ordered.map((c) => {
    // A specialisation that just shares its parent's Side Quests stores NULL and inherits.
    const inherits = c.parent && c.sideQuests === byId[c.parent]?.sideQuests;
    return [str(c.id), str(c.parent), str(c.name), str(c.field), str(c.emoji), num(c.hue), str(c.tagline), json(c.tags), str(c.check),
      json(c.dailyQuest), inherits ? 'NULL' : json(c.sideQuests), num(CAREERS.indexOf(c))];
  }),
  ['id'], ['parent_id', 'name', 'field', 'emoji', 'hue', 'tagline', 'tags', 'check_note', 'daily_quest', 'side_quests', 'position']));

section('Per-field source and last_updated', insert('career_fields',
  ['career_id', 'key', 'label', 'value', 'source', 'last_updated'],
  CAREERS.flatMap((c) => Object.entries(c.fields).map(([k, f]) => [str(c.id), str(k), str(f.label), str(f.value), str(f.source), ago(f.updated)])),
  ['career_id', 'key'], ['label', 'value', 'source', 'last_updated']));

// Roadmaps: replace children wholesale so removed steps do not linger.
const roadmapIds = Object.keys(ROADMAPS);
const paths = [], steps = [];
for (const id of roadmapIds) {
  ROADMAPS[id].paths.forEach((p, pi) => {
    paths.push([str(id), str(p.id), str(p.name), num(pi)]);
    p.steps.forEach((s, si) => {
      steps.push([str(id), str(p.id), num(si), str(s.id), str(s.title), str(s.type), num(s.dur[0]), num(s.dur[1]),
        s.cost ? num(s.cost[0]) : 'NULL', s.cost ? num(s.cost[1]) : 'NULL', str(s.eligibility), num(s.at), str(s.source), ago(s.updated), json(s.todo)]);
    });
  });
}
const idList = (ids) => ids.map(str).join(', ');
section('Roadmaps (replaced wholesale)', `delete from public.roadmap_paths where career_id in (${idList(roadmapIds)});\n` +
  insert('roadmap_paths', ['career_id', 'id', 'name', 'position'], paths, ['career_id', 'id'], ['name', 'position']) +
  insert('roadmap_steps', ['career_id', 'path_id', 'position', 'step_id', 'title', 'type', 'dur_min', 'dur_max', 'cost_min', 'cost_max', 'eligibility', 'at_stage', 'source', 'last_updated', 'todo'],
    steps, ['career_id', 'path_id', 'position'], ['step_id', 'title', 'type', 'dur_min', 'dur_max', 'cost_min', 'cost_max', 'eligibility', 'at_stage', 'source', 'last_updated', 'todo']));

const ladderIds = Object.keys(LADDERS);
const tracks = [], levels = [];
for (const id of ladderIds) {
  LADDERS[id].tracks.forEach((t, ti) => {
    tracks.push([str(id), str(t.id), str(t.name), num(ti)]);
    t.levels.forEach((l, li) => {
      levels.push([str(id), str(t.id), num(li), str(l.id), str(l.title), str(l.when), str(l.does), json(l.skills), str(l.moveUp),
        str(l.pay.label), str(l.pay.value), str(l.pay.source), ago(l.pay.updated)]);
    });
  });
}
section('Career ladders (replaced wholesale)', `delete from public.ladder_tracks where career_id in (${idList(ladderIds)});\n` +
  insert('ladder_tracks', ['career_id', 'id', 'name', 'position'], tracks, ['career_id', 'id'], ['name', 'position']) +
  insert('ladder_levels', ['career_id', 'track_id', 'position', 'level_id', 'title', 'when_text', 'does', 'skills', 'move_up', 'pay_label', 'pay_value', 'pay_source', 'pay_updated'],
    levels, ['career_id', 'track_id', 'position'], ['level_id', 'title', 'when_text', 'does', 'skills', 'move_up', 'pay_label', 'pay_value', 'pay_source', 'pay_updated']));

section('Quiz', insert('quiz_questions',
  ['version', 'id', 'position', 'type', 'title', 'help', 'max_choices', 'optional', 'options'],
  QUESTIONS.map((q, i) => [num(quizMeta.version), str(q.id), num(i), str(q.type), str(q.title), str(q.help), num(q.max), bool(q.optional), json(q.options)]),
  ['version', 'id'], ['position', 'type', 'title', 'help', 'max_choices', 'optional', 'options']));

// Change history (already published) and the pending review queue. Fixed ids from the seed key,
// and "do nothing" on conflict, so re-seeding never undoes a reviewer's decision.
const seedId = (key) => `md5('careerquest-seed:${key}')::uuid`;
const history = [], queue = [];
for (const c of CAREERS) {
  c.changeLog.forEach((h, i) => history.push([seedId(`history:${c.id}:${i}`), "'change'", str(c.id), str(h.field), str(h.from), str(h.to), str(h.source), 'NULL', "'approved'", ago(h.date)]));
}
for (const q of SEED_QUEUE) queue.push([seedId(`queue:${q.id}`), "'change'", str(q.roleId), str(q.field), str(q.old), str(q.next), str(q.source), str(q.note), "'pending'", 'now()']);
const logCols = ['id', 'kind', 'career_id', 'field', 'old_value', 'new_value', 'source', 'note', 'status', 'created_at'];
section('Published change history', insert('field_update_log', logCols, history.map((r) => [...r.slice(0, 7), r[7], r[8], r[9]]), ['id'], []));
section('Pending review queue (from the daily refresh)', insert('field_update_log', logCols, queue, ['id'], []));

const header = `-- GENERATED by web/scripts/generate-seed.mjs (npm run db:seed). Do not edit by hand.
-- Run supabase/migrations/0001_content.sql first, then paste this whole file into the SQL Editor.
--
-- Re-running resets every seeded career, field, roadmap, ladder and quiz row to the bundled sample
-- data (and resets field ages to "N days before now"). It never reverses a reviewer's decision on
-- the review queue. Content here is ILLUSTRATIVE SAMPLE data: replace it with reviewed figures.
-- Generated for ${CAREERS.length} careers, ${roadmapIds.length} roadmaps, ${ladderIds.length} ladders, ${QUESTIONS.length} quiz questions.

begin;

`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, header + parts.join('\n') + '\ncommit;\n');
console.log(`wrote ${out}`);
console.log(`  ${CAREERS.length} careers, ${CAREERS.length * 5} fields, ${roadmapIds.length} roadmaps (${steps.length} steps), ${ladderIds.length} ladders (${levels.length} levels), ${QUESTIONS.length} questions, ${queue.length} queued, ${history.length} history`);
