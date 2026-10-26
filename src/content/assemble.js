// Turns the database snapshot (rows from content_snapshot()) into the shapes the app already uses.
// Defensive on purpose: a half-edited row in the Table Editor must never crash the app, so
// anything incomplete is dropped (and reported) instead of thrown.

const FIELD_KEYS = ['salary', 'exam', 'study', 'cost', 'demand'];
const iso = (v) => new Date(v).toISOString();

export function assemble(snap) {
  if (!snap || !Array.isArray(snap.careers)) throw new Error('Malformed content snapshot');
  const dropped = [];

  const fieldsBy = {};
  for (const f of snap.career_fields || []) {
    (fieldsBy[f.career_id] ||= {})[f.key] = { label: f.label, value: f.value, source: f.source, updated: iso(f.last_updated) };
  }
  const historyBy = {};
  for (const h of snap.history || []) {
    (historyBy[h.career_id] ||= []).push({ date: iso(h.date), field: h.field, from: h.old_value ?? '', to: h.new_value, source: h.source });
  }

  // Careers need all five fields, and a specialisation needs a parent that survived.
  const rowIds = new Set(snap.careers.map((r) => r.id));
  let careers = [];
  for (const r of snap.careers) {
    const fields = fieldsBy[r.id];
    if (!fields || FIELD_KEYS.some((k) => !fields[k])) { dropped.push(`${r.id}: missing a field`); continue; }
    if (r.parent_id && !rowIds.has(r.parent_id)) { dropped.push(`${r.id}: parent ${r.parent_id} not found`); continue; }
    careers.push({
      id: r.id,
      ...(r.parent_id ? { parent: r.parent_id } : {}),
      name: r.name, field: r.field, emoji: r.emoji, hue: r.hue, tagline: r.tagline,
      tags: r.tags, fields, dailyQuest: r.daily_quest || [], check: r.check_note,
      sideQuests: r.side_quests, // null = inherit, resolved below
      changeLog: historyBy[r.id] || [],
    });
  }
  const alive = new Set(careers.map((c) => c.id));
  careers = careers.filter((c) => {
    const ok = !c.parent || alive.has(c.parent);
    if (!ok) dropped.push(`${c.id}: parent ${c.parent} was dropped`);
    return ok;
  });
  const byId = Object.fromEntries(careers.map((c) => [c.id, c]));
  for (const c of careers) {
    const own = c.sideQuests ?? (c.parent ? byId[c.parent]?.sideQuests : null) ?? [];
    c.sideQuests = own.filter((s) => byId[s.to] && s.to !== c.id); // never link to a role that does not exist
  }
  const ids = new Set(careers.map((c) => c.id));

  // Roadmaps
  const roadmaps = {};
  for (const p of snap.roadmap_paths || []) {
    if (!ids.has(p.career_id)) continue;
    (roadmaps[p.career_id] ||= { paths: [] }).paths.push({ id: p.id, name: p.name, steps: [] });
  }
  for (const s of snap.roadmap_steps || []) {
    const path = roadmaps[s.career_id]?.paths.find((p) => p.id === s.path_id);
    if (!path) continue;
    path.steps.push({
      id: s.step_id, title: s.title, type: s.type, dur: [s.dur_min, s.dur_max],
      cost: s.cost_min == null ? null : [s.cost_min, s.cost_max],
      eligibility: s.eligibility, at: s.at_stage, source: s.source, updated: iso(s.last_updated), todo: s.todo || [],
    });
  }
  for (const [id, rm] of Object.entries(roadmaps)) {
    rm.paths = rm.paths.filter((p) => p.steps.length);
    if (!rm.paths.length) delete roadmaps[id];
  }

  // Ladders
  const ladders = {};
  for (const t of snap.ladder_tracks || []) {
    if (!ids.has(t.career_id)) continue;
    (ladders[t.career_id] ||= { tracks: [] }).tracks.push({ id: t.id, name: t.name, levels: [] });
  }
  for (const v of snap.ladder_levels || []) {
    const track = ladders[v.career_id]?.tracks.find((t) => t.id === v.track_id);
    if (!track) continue;
    track.levels.push({
      id: v.level_id, title: v.title, when: v.when_text, does: v.does, skills: v.skills || [], moveUp: v.move_up,
      pay: { label: v.pay_label, value: v.pay_value, source: v.pay_source, updated: iso(v.pay_updated) },
    });
  }
  for (const [id, l] of Object.entries(ladders)) {
    l.tracks = l.tracks.filter((t) => t.levels.length);
    if (!l.tracks.length) delete ladders[id];
  }

  const quizRows = snap.quiz || [];
  const quiz = quizRows.length
    ? {
        version: quizRows[0].version,
        questions: quizRows.map((q) => ({
          id: q.id, type: q.type, title: q.title,
          ...(q.help ? { help: q.help } : {}), ...(q.max_choices ? { max: q.max_choices } : {}), ...(q.optional ? { optional: true } : {}),
          options: q.options,
        })),
      }
    : null;

  return { careers, roadmaps, ladders, quiz, dropped };
}
