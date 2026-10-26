// Curated role data. ILLUSTRATIVE SAMPLE FOR THE PROTOTYPE: every figure must be replaced with
// reviewed, sourced data before launch. Each field carries its own source and last_updated (US17).
import { daysAgo } from '../lib/freshness';

const f = (label, value, source, days) => ({ label, value, source, updated: daysAgo(days) });
const SRC = {
  pay: 'Salary survey (sample)',
  exam: 'Official exam notice (sample)',
  study: 'College prospectus (sample)',
  cost: 'Fee structures (sample)',
  demand: 'Hiring trends report (sample)',
};

// tags drive the rule-based matcher:
//   subjects/style/interests: overlap with quiz answers
//   exams/years/cost/reloc: 0 (low) .. 2 (high) demand placed on the student
//   flags: things a student may have said they don't want
// fx: build all five fields from [value, ageInDays] pairs.
const fx = (pay, exam, study, cost, demand) => ({
  salary: f('Entry salary', pay[0], SRC.pay, pay[1]),
  exam: f('Entry exam', exam[0], SRC.exam, exam[1]),
  study: f('Study needed', study[0], SRC.study, study[1]),
  cost: f('Study cost', cost[0], SRC.cost, cost[1]),
  demand: f('Demand', demand[0], SRC.demand, demand[1]),
});

const BASE = [
  {
    id: 'data-analyst', name: 'Data Analyst', field: 'tech', emoji: '📊', hue: 215,
    tagline: 'Turns messy numbers into decisions.',
    tags: { subjects: ['maths', 'computers'], style: ['data'], interests: ['puzzles', 'tech', 'business'], exams: 0, years: 0, cost: 0, reloc: 1, flags: ['desk', 'maths'] },
    fields: {
      salary: f('Entry salary', '₹4–9 LPA', SRC.pay, 12),
      exam: f('Entry exam', 'None for most jobs', SRC.exam, 120),
      study: f('Study needed', '3–4 year degree; maths or stats helps', SRC.study, 40),
      cost: f('Study cost', '₹1–4 L in total', SRC.cost, 70),
      demand: f('Demand', 'Growing', SRC.demand, 25),
    },
    dailyQuest: [
      ['9:30', 'Standup: you learn which dashboard broke overnight.'],
      ['10:30', 'Clean a messy sales spreadsheet using SQL or Excel.'],
      ['14:30', 'Build a chart that shows why orders dipped last week.'],
      ['17:00', 'Present two findings and one recommendation to your manager.'],
    ],
    check: 'Needs comfort with Excel and SQL, and entry roles are competitive.',
    sideQuests: [
      { to: 'software-dev', carries: 'SQL, Python and problem-solving' },
      { to: 'financial-analyst', carries: 'Excel and statistics' },
      { to: 'digital-marketer', carries: 'Analytics and reporting' },
    ],
    changeLog: [{ date: daysAgo(12), field: 'salary', from: '₹3.5–8 LPA', to: '₹4–9 LPA', source: SRC.pay }],
  },
  {
    id: 'software-dev', name: 'Software Developer', field: 'tech', emoji: '💻', hue: 230,
    tagline: 'Builds the apps and tools people use every day.',
    tags: { subjects: ['maths', 'computers'], style: ['data', 'creative'], interests: ['tech', 'puzzles'], exams: 1, years: 1, cost: 1, reloc: 1, flags: ['desk'] },
    fields: {
      salary: f('Entry salary', '₹4–12 LPA', SRC.pay, 20),
      exam: f('Entry exam', 'JEE for top engineering colleges; none for BCA', SRC.exam, 60),
      study: f('Study needed', '3–4 year degree (BCA or B.Tech)', SRC.study, 45),
      cost: f('Study cost', '₹1.5–12 L in total', SRC.cost, 80),
      demand: f('Demand', 'Steady', SRC.demand, 30),
    },
    dailyQuest: [
      ['10:00', 'Standup, then pick up a bug ticket from the team board.'],
      ['11:00', 'Read the code around the bug and find the cause.'],
      ['15:00', 'Write the fix and a test that proves it works.'],
      ['17:30', 'A teammate reviews your code and suggests one improvement.'],
    ],
    check: 'Tools change every few years, so you keep learning on the job.',
    sideQuests: [
      { to: 'data-analyst', carries: 'Python, logic and databases' },
      { to: 'ux-designer', carries: 'Front-end skills and product sense' },
      { to: 'cyber-analyst', carries: 'Coding and networking basics' },
    ],
    changeLog: [],
  },
  {
    id: 'ux-designer', name: 'UX Designer', field: 'tech', emoji: '🎨', hue: 285,
    tagline: 'Makes products easy and pleasant to use.',
    tags: { subjects: ['languages', 'computers'], style: ['creative', 'people'], interests: ['design', 'tech', 'helping'], exams: 1, years: 1, cost: 1, reloc: 1, flags: ['desk'] },
    fields: {
      salary: f('Entry salary', '₹4–10 LPA', SRC.pay, 18),
      exam: f('Entry exam', 'Optional design entrance (for example UCEED, NID DAT)', SRC.exam, 100),
      study: f('Study needed', '3–4 year design degree, or any degree plus courses', SRC.study, 55),
      cost: f('Study cost', '₹1–10 L in total', SRC.cost, 75),
      demand: f('Demand', 'Growing', SRC.demand, 35),
    },
    dailyQuest: [
      ['10:00', 'Talk to three users about why they abandon the checkout page.'],
      ['12:00', 'Sketch two alternative layouts on paper.'],
      ['15:00', 'Turn the best sketch into a clickable prototype.'],
      ['17:00', 'Show it to engineers and agree what can be built this month.'],
    ],
    check: 'A portfolio matters more than marks, so you need to build one early.',
    sideQuests: [
      { to: 'software-dev', carries: 'Front-end skills' },
      { to: 'digital-marketer', carries: 'Content and understanding users' },
      { to: 'data-analyst', carries: 'User research and metrics' },
    ],
    changeLog: [],
  },
  {
    id: 'cyber-analyst', name: 'Cybersecurity Analyst', field: 'tech', emoji: '🛡️', hue: 195,
    tagline: 'Spots and stops attacks before they cause damage.',
    tags: { subjects: ['computers', 'maths'], style: ['data', 'hands'], interests: ['tech', 'puzzles'], exams: 0, years: 1, cost: 1, reloc: 1, flags: ['desk'] },
    fields: {
      salary: f('Entry salary', '₹4–10 LPA', SRC.pay, 30),
      exam: f('Entry exam', 'None; certifications help', SRC.exam, 50),
      study: f('Study needed', '3–4 year degree in computers or IT', SRC.study, 60),
      cost: f('Study cost', '₹1.5–8 L in total', SRC.cost, 85),
      demand: f('Demand', 'Growing', SRC.demand, 20),
    },
    dailyQuest: [
      ['9:00', 'Review overnight alerts and sort real threats from false alarms.'],
      ['11:30', 'Investigate a suspicious login from another country.'],
      ['14:30', 'Test the company website for weak spots, with permission.'],
      ['17:00', 'Write a short report so the team can close the gap.'],
    ],
    check: 'Some roles involve shifts or being on call.',
    sideQuests: [
      { to: 'software-dev', carries: 'Coding and systems knowledge' },
      { to: 'data-analyst', carries: 'Log analysis and SQL' },
      { to: 'ux-designer', carries: 'Thinking about how people use systems' },
    ],
    changeLog: [],
  },
  {
    id: 'doctor', name: 'Doctor (MBBS)', field: 'health', emoji: '🩺', hue: 165,
    tagline: 'Diagnoses and treats patients, from first checkup to follow-up.',
    tags: { subjects: ['science'], style: ['people', 'hands'], interests: ['helping', 'health'], exams: 2, years: 2, cost: 2, reloc: 2, flags: ['clinical', 'longStudy', 'exams', 'relocation'] },
    fields: {
      salary: f('Entry salary', '₹6–12 LPA (junior doctor)', SRC.pay, 22),
      exam: f('Entry exam', 'NEET-UG', SRC.exam, 15),
      study: f('Study needed', '5.5-year MBBS, then optional specialisation', SRC.study, 95),
      cost: f('Study cost', '₹1–60 L (government vs private seat)', SRC.cost, 40),
      demand: f('Demand', 'Steady', SRC.demand, 28),
    },
    dailyQuest: [
      ['8:00', 'Ward rounds: check on each patient with the senior doctor.'],
      ['10:00', 'Outpatient clinic: listen, examine, and decide on tests.'],
      ['14:00', 'Read lab reports and adjust treatment plans.'],
      ['20:00', 'Night duty on call for emergencies.'],
    ],
    check: 'Entry is very competitive, study is long, and private seats are costly.',
    sideQuests: [
      { to: 'nurse', carries: 'Anatomy and patient care' },
      { to: 'physio', carries: 'Anatomy and clinical practice' },
      { to: 'pharmacist', carries: 'Pharmacology' },
    ],
    changeLog: [],
  },
  {
    id: 'nurse', name: 'Nurse', field: 'health', emoji: '💉', hue: 175,
    tagline: 'Cares for patients day to day and keeps the ward running.',
    tags: { subjects: ['science'], style: ['people', 'hands'], interests: ['helping', 'health'], exams: 1, years: 1, cost: 0, reloc: 1, flags: ['clinical'] },
    fields: {
      salary: f('Entry salary', '₹2.5–5 LPA', SRC.pay, 33),
      exam: f('Entry exam', 'Varies by state and college', SRC.exam, 110),
      study: f('Study needed', '4-year B.Sc Nursing, or 3-year GNM', SRC.study, 66),
      cost: f('Study cost', '₹40k–6 L in total', SRC.cost, 80),
      demand: f('Demand', 'Growing', SRC.demand, 18),
    },
    dailyQuest: [
      ['7:00', 'Handover from the night shift and review each patient.'],
      ['9:00', 'Give medicines, check vitals and update charts.'],
      ['13:00', 'Help a patient and family understand discharge instructions.'],
      ['15:00', 'Hand over to the evening shift.'],
    ],
    check: 'Shift work, including nights, is normal.',
    sideQuests: [
      { to: 'physio', carries: 'Patient care and anatomy' },
      { to: 'pharmacist', carries: 'Medicine knowledge' },
      { to: 'doctor', carries: 'Clinical experience (further exams needed)' },
    ],
    changeLog: [],
  },
  {
    id: 'physio', name: 'Physiotherapist', field: 'health', emoji: '🦵', hue: 150,
    tagline: 'Helps people recover movement after injury or illness.',
    tags: { subjects: ['science'], style: ['people', 'hands'], interests: ['health', 'helping'], exams: 1, years: 1, cost: 1, reloc: 1, flags: ['clinical'] },
    fields: {
      salary: f('Entry salary', '₹2.5–5 LPA', SRC.pay, 41),
      exam: f('Entry exam', 'Varies by state and college', SRC.exam, 70),
      study: f('Study needed', '4.5-year BPT including internship', SRC.study, 72),
      cost: f('Study cost', '₹1–8 L in total', SRC.cost, 88),
      demand: f('Demand', 'Growing', SRC.demand, 30),
    },
    dailyQuest: [
      ['9:00', 'Assess a patient who had knee surgery last week.'],
      ['10:30', 'Guide them through a set of exercises.'],
      ['14:00', 'Treat a sports injury with hands-on therapy.'],
      ['16:30', 'Update each recovery plan and note progress.'],
    ],
    check: 'Physically demanding, and many people run their own clinic after a few years.',
    sideQuests: [
      { to: 'nurse', carries: 'Patient care' },
      { to: 'doctor', carries: 'Anatomy (further exams needed)' },
      { to: 'pharmacist', carries: 'Medicine basics' },
    ],
    changeLog: [],
  },
  {
    id: 'pharmacist', name: 'Pharmacist', field: 'health', emoji: '💊', hue: 140,
    tagline: 'Makes sure people get the right medicine, safely.',
    tags: { subjects: ['science'], style: ['data', 'hands'], interests: ['health', 'helping', 'puzzles'], exams: 1, years: 1, cost: 1, reloc: 1, flags: [] },
    fields: {
      salary: f('Entry salary', '₹2.5–5 LPA', SRC.pay, 38),
      exam: f('Entry exam', 'State or college entrance, varies', SRC.exam, 65),
      study: f('Study needed', '4-year B.Pharm, or 2-year D.Pharm', SRC.study, 58),
      cost: f('Study cost', '₹1–8 L in total', SRC.cost, 77),
      demand: f('Demand', 'Steady', SRC.demand, 44),
    },
    dailyQuest: [
      ['9:30', 'Check a prescription for doses and drug clashes.'],
      ['11:00', 'Explain to a patient when and how to take their medicines.'],
      ['14:00', 'Update stock and flag medicines close to expiry.'],
      ['16:30', 'Call a doctor to clarify an unclear prescription.'],
    ],
    check: 'Retail pharmacy pay is modest, while hospital and pharma-industry roles vary.',
    sideQuests: [
      { to: 'nurse', carries: 'Medicine knowledge' },
      { to: 'data-analyst', carries: 'Clinical data and records' },
      { to: 'doctor', carries: 'Pharmacology (further exams needed)' },
    ],
    changeLog: [],
  },
  {
    id: 'ca', name: 'Chartered Accountant', field: 'business', emoji: '🧾', hue: 40,
    tagline: 'Keeps money honest: accounts, tax and audits.',
    tags: { subjects: ['commerce', 'maths'], style: ['data'], interests: ['business', 'puzzles'], exams: 2, years: 2, cost: 0, reloc: 0, flags: ['desk', 'exams', 'longStudy'] },
    fields: {
      salary: f('Entry salary', '₹7–12 LPA (newly qualified)', SRC.pay, 26),
      exam: f('Entry exam', 'CA Foundation', SRC.exam, 40),
      study: f('Study needed', 'About 4.5–5 years including articleship', SRC.study, 52),
      cost: f('Study cost', '₹1–3 L, excluding coaching', SRC.cost, 83),
      demand: f('Demand', 'Steady', SRC.demand, 36),
    },
    dailyQuest: [
      ['10:00', 'Check a client’s books for mistakes before tax filing.'],
      ['12:30', 'Reconcile bank statements with the ledger.'],
      ['15:00', 'Join an audit visit to a small factory.'],
      ['18:00', 'Explain a tax notice to a worried client.'],
    ],
    check: 'Pass rates are low, and you need steady study for years.',
    sideQuests: [
      { to: 'financial-analyst', carries: 'Accounting and audit' },
      { to: 'data-analyst', carries: 'Excel and analysis' },
      { to: 'hr-manager', carries: 'Payroll and compliance' },
    ],
    changeLog: [{ date: daysAgo(40), field: 'exam', from: 'CA Foundation (older rules)', to: 'CA Foundation', source: SRC.exam }],
  },
  {
    id: 'digital-marketer', name: 'Digital Marketer', field: 'business', emoji: '📣', hue: 20,
    tagline: 'Helps people discover products through content, search and ads.',
    tags: { subjects: ['languages', 'computers'], style: ['creative', 'people'], interests: ['business', 'design'], exams: 0, years: 0, cost: 0, reloc: 0, flags: ['desk'] },
    fields: {
      salary: f('Entry salary', '₹3–7 LPA', SRC.pay, 15),
      exam: f('Entry exam', 'None', SRC.exam, 80),
      study: f('Study needed', 'Any degree plus short courses', SRC.study, 47),
      cost: f('Study cost', '₹10k–3 L in total', SRC.cost, 69),
      demand: f('Demand', 'Growing', SRC.demand, 22),
    },
    dailyQuest: [
      ['10:00', 'Check how yesterday’s ad campaign performed.'],
      ['11:30', 'Write three headline options and test them.'],
      ['14:00', 'Plan a week of social posts with the design team.'],
      ['16:30', 'Report to the founder what brought in new customers.'],
    ],
    check: 'Platforms and tools change fast, so results matter more than certificates.',
    sideQuests: [
      { to: 'ux-designer', carries: 'Content and understanding users' },
      { to: 'data-analyst', carries: 'Analytics and reporting' },
      { to: 'hr-manager', carries: 'Communication and people skills' },
    ],
    changeLog: [],
  },
  {
    id: 'financial-analyst', name: 'Financial Analyst', field: 'business', emoji: '📈', hue: 55,
    tagline: 'Studies company numbers to guide money decisions.',
    tags: { subjects: ['commerce', 'maths'], style: ['data'], interests: ['business', 'puzzles'], exams: 1, years: 1, cost: 1, reloc: 1, flags: ['desk', 'maths'] },
    fields: {
      salary: f('Entry salary', '₹5–10 LPA', SRC.pay, 19),
      exam: f('Entry exam', 'None required; CFA is optional', SRC.exam, 55),
      study: f('Study needed', '3-year commerce or maths degree, often plus MBA', SRC.study, 62),
      cost: f('Study cost', '₹1–25 L in total', SRC.cost, 74),
      demand: f('Demand', 'Steady', SRC.demand, 33),
    },
    dailyQuest: [
      ['9:30', 'Read overnight market news and company results.'],
      ['11:00', 'Update a spreadsheet model for a company’s next-year profit.'],
      ['14:30', 'Compare two companies and note the risks.'],
      ['17:00', 'Present your view to the investment team.'],
    ],
    check: 'Strong Excel and a good grip on accounting are expected.',
    sideQuests: [
      { to: 'data-analyst', carries: 'Excel and statistics' },
      { to: 'ca', carries: 'Accounting (extra exams needed)' },
      { to: 'digital-marketer', carries: 'Market research and reporting' },
    ],
    changeLog: [],
  },
  {
    id: 'hr-manager', name: 'HR Manager', field: 'business', emoji: '🤝', hue: 340,
    tagline: 'Hires, supports and grows the people in a company.',
    tags: { subjects: ['social', 'languages'], style: ['people'], interests: ['business', 'helping'], exams: 1, years: 1, cost: 2, reloc: 1, flags: ['desk'] },
    fields: {
      salary: f('Entry salary', '₹3.5–7 LPA', SRC.pay, 29),
      exam: f('Entry exam', 'MBA entrance (for example CAT, XAT) for top colleges', SRC.exam, 90),
      study: f('Study needed', '3-year degree plus 2-year MBA or PGDM in HR', SRC.study, 51),
      cost: f('Study cost', '₹3–25 L in total', SRC.cost, 78),
      demand: f('Demand', 'Steady', SRC.demand, 42),
    },
    dailyQuest: [
      ['10:00', 'Interview a candidate for a sales role.'],
      ['12:00', 'Help a new joiner with onboarding.'],
      ['15:00', 'Mediate a disagreement between two teammates.'],
      ['17:00', 'Update the leave policy and explain it to staff.'],
    ],
    check: 'Entry usually needs an MBA, which adds time and cost.',
    sideQuests: [
      { to: 'digital-marketer', carries: 'Communication and employer branding' },
      { to: 'financial-analyst', carries: 'Compensation and budgeting' },
      { to: 'ca', carries: 'Payroll and compliance (extra exams needed)' },
    ],
    changeLog: [],
  },
  // ---------- new top-level Tech roles ----------
  {
    id: 'product-manager', name: 'Product Manager', field: 'tech', emoji: '🧩', hue: 255,
    tagline: 'Decides what a team builds next, and why.',
    tags: { subjects: ['computers', 'commerce', 'languages'], style: ['people', 'data', 'creative'], interests: ['tech', 'business', 'puzzles'], exams: 1, years: 1, cost: 1, reloc: 1, flags: ['desk'] },
    fields: fx(
      ['₹10–25 LPA (usually after 2–4 years in another role)', 17],
      ['None; MBA entrance (for example CAT) if you take the MBA route', 85],
      ['3–4 year degree, often plus MBA; many start in engineering, design or analytics', 53],
      ['₹2–30 L in total', 79],
      ['Steady', 31],
    ),
    dailyQuest: [
      ['10:00', 'Talk to three customers about what annoys them most.'],
      ['12:00', 'Sort the to-do list: what should the team build first?'],
      ['15:00', 'Write a one-page plan so engineers and designers agree.'],
      ['17:00', 'Check how last week’s launch performed and share the numbers.'],
    ],
    check: 'It is rarely a first job. Most product managers start in another role first.',
    sideQuests: [
      { to: 'ux-designer', carries: 'User research and product sense' },
      { to: 'data-analyst', carries: 'Metrics and SQL' },
      { to: 'software-dev', carries: 'Working closely with engineers' },
    ],
    changeLog: [],
  },
  {
    id: 'data-scientist', name: 'Data Scientist', field: 'tech', emoji: '🧠', hue: 205,
    tagline: 'Builds models that predict and recommend from data.',
    tags: { subjects: ['maths', 'computers'], style: ['data'], interests: ['tech', 'puzzles'], exams: 1, years: 1, cost: 1, reloc: 1, flags: ['desk', 'maths'] },
    fields: fx(
      ['₹6–15 LPA', 21],
      ['None; some master’s programmes use entrance exams', 96],
      ['3–4 year degree in maths, stats or computers; a master’s is common', 49],
      ['₹1.5–15 L in total', 76],
      ['Growing', 24],
    ),
    dailyQuest: [
      ['10:00', 'Check why yesterday’s model got worse on new data.'],
      ['12:00', 'Clean a large dataset and pick which columns matter.'],
      ['15:00', 'Train two models and compare their mistakes.'],
      ['17:00', 'Explain the result to a manager without using jargon.'],
    ],
    check: 'Needs strong maths and coding, and many roles prefer a master’s degree.',
    sideQuests: [
      { to: 'data-analyst', carries: 'SQL, statistics and storytelling with data' },
      { to: 'software-dev', carries: 'Python and engineering habits' },
      { to: 'product-manager', carries: 'Metrics and experiments' },
    ],
    changeLog: [],
  },
  {
    id: 'devops-engineer', name: 'Cloud / DevOps Engineer', field: 'tech', emoji: '☁️', hue: 190,
    tagline: 'Keeps apps running smoothly on servers and in the cloud.',
    tags: { subjects: ['computers'], style: ['hands', 'data'], interests: ['tech', 'puzzles'], exams: 0, years: 1, cost: 1, reloc: 1, flags: ['desk'] },
    fields: fx(
      ['₹5–12 LPA', 27],
      ['None; cloud certifications help', 58],
      ['3–4 year degree in computers or IT, or a diploma plus certifications', 64],
      ['₹1.5–10 L in total', 82],
      ['Growing', 19],
    ),
    dailyQuest: [
      ['9:30', 'Check dashboards for slow or failing services.'],
      ['11:30', 'Automate a deployment so releases take minutes, not hours.'],
      ['14:30', 'Cut cloud costs by shutting down unused servers.'],
      ['17:00', 'Help a developer find why their app crashes only in production.'],
    ],
    check: 'On-call duty is common when something breaks at night.',
    sideQuests: [
      { to: 'software-dev', carries: 'Coding and systems knowledge' },
      { to: 'cyber-analyst', carries: 'Networking and server security' },
      { to: 'data-scientist', carries: 'Running data systems at scale' },
    ],
    changeLog: [],
  },
  {
    id: 'qa-engineer', name: 'QA / Test Engineer', field: 'tech', emoji: '🧪', hue: 170,
    tagline: 'Finds problems in software before users do.',
    tags: { subjects: ['computers'], style: ['data'], interests: ['tech', 'puzzles'], exams: 0, years: 0, cost: 0, reloc: 0, flags: ['desk'] },
    fields: fx(
      ['₹3–7 LPA', 23],
      ['None', 75],
      ['Any degree plus a testing course, or BCA or B.Tech', 52],
      ['₹20k–6 L in total', 67],
      ['Steady', 38],
    ),
    dailyQuest: [
      ['10:00', 'Try the new checkout page and write down every way it breaks.'],
      ['12:00', 'Write steps so a developer can repeat each bug.'],
      ['15:00', 'Automate a test that runs on every release.'],
      ['17:00', 'Tell the team whether this version is ready to ship.'],
    ],
    check: 'Pay grows faster once you learn test automation and coding.',
    sideQuests: [
      { to: 'software-dev', carries: 'Coding and understanding how software breaks' },
      { to: 'cyber-analyst', carries: 'Finding weak spots in systems' },
      { to: 'product-manager', carries: 'Knowing what users notice' },
    ],
    changeLog: [],
  },
];

// ---------- sub-roles (specialisations) ----------
// A sub-role is a full card of its own, linked to a parent. It inherits the parent's field, matching
// tags and Side Quests unless it overrides them.
const sub = (parentId, id, name, emoji, tagline, fields, dailyQuest, check, over = {}) => {
  const P = BASE.find((c) => c.id === parentId);
  return {
    id, parent: parentId, name, emoji, tagline, field: P.field, hue: P.hue,
    tags: { ...P.tags, ...(over.tags || {}) },
    fields, dailyQuest, check,
    sideQuests: over.sideQuests || P.sideQuests,
    changeLog: [],
  };
};

const DOC_COST = ['₹4 L–₹1 Cr+ across MBBS and MD or MS (government vs private seats)', 60];
const DOC_EXAM = ['NEET-UG, then NEET-PG for the specialisation', 25];

const SUBS = [
  // Doctor
  sub('doctor', 'gp', 'General Physician', '🩺', 'First point of care: treats common illness and refers when needed.',
    fx(['₹6–14 LPA (government and private clinics differ)', 30], ['NEET-UG. No PG exam needed to practise', 25], ['5.5-year MBBS including internship', 90], ['₹1–60 L (government vs private seat)', 45], ['Steady', 30]),
    [['9:00', 'See patients with fever, infections and long-term conditions.'], ['13:00', 'Decide who needs tests and who needs a specialist.'], ['17:00', 'Follow up on test reports and adjust treatment.']],
    'You treat many kinds of problems, so you keep learning widely rather than going deep.'),
  sub('doctor', 'surgeon', 'Surgeon', '🔪', 'Operates to repair, remove or rebuild what medicine alone cannot fix.',
    fx(['₹12–30 LPA (after specialisation)', 24], DOC_EXAM, ['MBBS plus 3-year MS in surgery: about 9 years in all', 80], DOC_COST, ['Steady', 28]),
    [['7:30', 'Review the day’s operation list with the team.'], ['9:00', 'Operate: plan, cut, repair and close.'], ['15:00', 'Check on patients recovering from yesterday’s surgery.'], ['Night', 'Emergency calls when someone is hurt.']],
    'Long hours standing, emergency calls and years of training before you operate independently.'),
  sub('doctor', 'paediatrician', 'Paediatrician', '🧸', 'Looks after the health of babies, children and teenagers.',
    fx(['₹10–25 LPA (after specialisation)', 31], DOC_EXAM, ['MBBS plus 3-year MD in paediatrics: about 9 years in all', 70], DOC_COST, ['Steady', 33]),
    [['9:00', 'Check a newborn’s growth and vaccines.'], ['11:30', 'Calm a worried parent and a crying child at the same time.'], ['15:00', 'Treat children with asthma, infections or allergies.']],
    'Working with anxious parents is part of the job, and so are night calls.'),
  sub('doctor', 'cardiologist', 'Cardiologist', '❤️', 'Treats diseases of the heart and blood vessels.',
    fx(['₹18–50 LPA (after super-specialisation)', 27], ['NEET-UG, NEET-PG, then NEET-SS for the DM', 35], ['MBBS, MD in medicine, then 3-year DM: about 12 years in all', 66], ['₹6 L–₹2 Cr+ across all stages (government vs private seats)', 70], ['Growing', 22]),
    [['8:00', 'Read ECGs and scans from overnight admissions.'], ['11:00', 'Run a stress test and explain results to a patient.'], ['14:00', 'Help in a procedure to open a blocked artery.']],
    'It is the longest path of the specialisations and needs three entrance exams.'),
  sub('doctor', 'dermatologist', 'Dermatologist', '🧴', 'Treats skin, hair and nail conditions.',
    fx(['₹12–30 LPA (after specialisation)', 29], DOC_EXAM, ['MBBS plus 3-year MD in dermatology: about 9 years in all', 120], DOC_COST, ['Growing', 23]),
    [['10:00', 'Diagnose rashes, acne and fungal infections.'], ['13:00', 'Do minor skin procedures like removing a mole.'], ['16:00', 'Counsel patients on long-term skin care.']],
    'Seats are limited and sought after, so the NEET-PG rank needed is high.'),
  sub('doctor', 'psychiatrist', 'Psychiatrist', '🧘', 'Treats mental health conditions with talk therapy and medicine.',
    fx(['₹10–25 LPA (after specialisation)', 32], DOC_EXAM, ['MBBS plus 3-year MD in psychiatry: about 9 years in all', 60], DOC_COST, ['Growing', 21]),
    [['10:00', 'Hold long, careful conversations with patients.'], ['13:00', 'Review medicines and side effects.'], ['16:00', 'Work with therapists and families on a care plan.']],
    'It is emotionally demanding and needs patience and strong listening.'),
  sub('doctor', 'radiologist', 'Radiologist', '🩻', 'Reads X-rays, CT and MRI scans to find what is wrong.',
    fx(['₹14–35 LPA (after specialisation)', 26], DOC_EXAM, ['MBBS plus 3-year MD in radiodiagnosis: about 9 years in all', 75], DOC_COST, ['Growing', 25]),
    [['9:00', 'Read the overnight scans and flag urgent cases.'], ['12:00', 'Guide a needle to take a sample using ultrasound.'], ['15:00', 'Discuss tricky images with surgeons.']],
    'Much of the work is screen-based with little patient contact, and AI tools are changing it.'),
  sub('doctor', 'dentist', 'Dentist', '🦷', 'Looks after teeth, gums and the mouth. A separate degree (BDS), not a specialisation of MBBS.',
    fx(['₹3–8 LPA (new dentist; private practice income varies widely)', 34], ['NEET-UG (for BDS)', 28], ['5-year BDS including internship; optional 3-year MDS', 85], ['₹1–45 L (government vs private seat)', 55], ['Steady', 40]),
    [['10:00', 'Fill cavities and clean teeth.'], ['13:00', 'Take X-rays and plan a root canal.'], ['16:00', 'Fit braces or crowns and explain aftercare.']],
    'Many dentists open their own clinic, which needs money and patience to build a patient base.',
    { sideQuests: [{ to: 'doctor', carries: 'Anatomy (a different degree and exams are needed)' }, { to: 'pharmacist', carries: 'Medicine knowledge' }, { to: 'physio', carries: 'Anatomy and patient care' }] }),

  // Software Developer
  sub('software-dev', 'frontend-dev', 'Frontend Developer', '🖼️', 'Builds the part of a website or app that people see and tap.',
    fx(['₹3.5–10 LPA', 20], ['None for BCA; JEE for top B.Tech', 60], ['3–4 year degree, or any degree plus a coding course', 45], ['₹1–12 L in total', 80], ['Growing', 25]),
    [['10:00', 'Fix a button that breaks on small phones.'], ['12:30', 'Turn a design into a working page.'], ['15:00', 'Make the page load faster on slow networks.']],
    'Browsers, devices and frameworks keep changing, so you relearn often.'),
  sub('software-dev', 'backend-dev', 'Backend Developer', '🗄️', 'Builds the servers, databases and APIs behind apps.',
    fx(['₹4–12 LPA', 22], ['None for BCA; JEE for top B.Tech', 60], ['3–4 year degree in computers or IT', 48], ['₹1.5–12 L in total', 81], ['Steady', 30]),
    [['10:00', 'Design an API that the mobile app will call.'], ['12:30', 'Find why one database query is slow.'], ['15:30', 'Add checks so bad data never gets saved.']],
    'When servers fail at night you may be on call.'),
  sub('software-dev', 'mobile-dev', 'Mobile App Developer', '📱', 'Builds apps for Android and iPhone.',
    fx(['₹4–12 LPA', 18], ['None for BCA; JEE for top B.Tech', 60], ['3–4 year degree, or any degree plus an app-building course', 52], ['₹1–12 L in total', 79], ['Steady', 34]),
    [['10:00', 'Test the app on an old low-memory phone.'], ['13:00', 'Build a new screen and connect it to the server.'], ['16:00', 'Fix a crash reported by users.']],
    'Android and iOS need different skills, or a shared toolkit that has its own limits.'),
  sub('software-dev', 'game-dev', 'Game Developer', '🎮', 'Builds the code that makes games run and feel good to play.',
    fx(['₹3–9 LPA', 35], ['None; some game-design colleges have their own entrance tests', 95], ['3–4 year degree plus a portfolio of playable games', 58], ['₹1–10 L in total', 93], ['Steady', 41]),
    [['10:30', 'Fix a bug that lets players walk through walls.'], ['13:00', 'Tune how the jump feels so it is fun.'], ['16:00', 'Playtest a new level with the team.']],
    'There are fewer jobs than in general software, so a portfolio of finished games matters.'),

  // Designer
  sub('ux-designer', 'ui-designer', 'UI Designer', '🖌️', 'Designs how screens look: colours, type, icons and layout.',
    fx(['₹3.5–9 LPA', 19], ['Optional design entrance (for example UCEED, NID DAT)', 100], ['3–4 year design degree, or any degree plus courses', 56], ['₹1–10 L in total', 74], ['Growing', 36]),
    [['10:00', 'Make a set of buttons and colours the whole app can reuse.'], ['13:00', 'Redesign a cluttered settings screen.'], ['16:00', 'Hand designs to engineers with clear notes.']],
    'Your portfolio is judged on visual craft, so you need to build one early.'),
  sub('ux-designer', 'ux-researcher', 'UX Researcher', '🔬', 'Finds out what users really need by watching and asking them.',
    fx(['₹4–10 LPA', 24], ['None', 70], ['Any degree (psychology, design or social science help) plus research methods', 60], ['₹1–8 L in total', 76], ['Steady', 39]),
    [['10:00', 'Interview a delivery rider about how they use the app.'], ['13:00', 'Find the patterns across five interviews.'], ['16:00', 'Present what you learned to the product team.']],
    'There are fewer openings than designer roles, and writing and listening matter a lot.'),
  sub('ux-designer', 'graphic-designer', 'Graphic Designer', '🎞️', 'Designs posters, logos, social posts and brand looks.',
    fx(['₹2.5–6 LPA', 21], ['Optional design entrance (for example NID DAT, NIFT)', 105], ['3-year design degree or diploma, or self-taught with a portfolio', 62], ['₹30k–8 L in total', 78], ['Steady', 43]),
    [['10:00', 'Design three logo ideas for a local bakery.'], ['13:00', 'Resize one poster for five social platforms.'], ['16:00', 'Fix the client’s feedback by tomorrow morning.']],
    'Many clients pay per project, so income can be uneven when you start.'),

  // Data
  sub('data-analyst', 'business-analyst', 'Business Analyst', '💼', 'Turns business problems into clear requirements and numbers.',
    fx(['₹4–9 LPA', 28], ['None; MBA entrance if you take the MBA route', 65], ['3-year degree, an MBA is helpful', 50], ['₹1–20 L in total', 77], ['Steady', 32]),
    [['10:00', 'Ask the sales team what is slowing down orders.'], ['13:00', 'Draw the process on one page and mark the delays.'], ['16:00', 'Present two fixes with their expected effect.']],
    'You spend more time talking to people than building models.'),
  sub('data-analyst', 'data-engineer', 'Data Engineer', '🔧', 'Builds the pipelines that move and organise data for everyone else.',
    fx(['₹5–12 LPA', 26], ['None for BCA; JEE for top B.Tech', 60], ['3–4 year degree in computers or IT', 54], ['₹1.5–10 L in total', 80], ['Growing', 22]),
    [['10:00', 'Fix a pipeline that stopped loading sales data.'], ['13:00', 'Move a slow report to run overnight.'], ['16:00', 'Add checks that catch bad data early.']],
    'Mostly invisible work: you get noticed only when something breaks.'),
  sub('data-scientist', 'ml-engineer', 'Machine Learning Engineer', '🧬', 'Takes models from notebooks to apps that real people use.',
    fx(['₹8–18 LPA', 20], ['None; master’s entrance for some programmes', 92], ['B.Tech or B.Sc plus ML specialisation; a master’s is common', 48], ['₹2–20 L in total', 81], ['Growing', 18]),
    [['10:00', 'Make a model fast enough to answer in under a second.'], ['13:00', 'Find why accuracy drops for some users.'], ['16:00', 'Set up alerts for when the model starts drifting.']],
    'Needs strong coding and maths, and there are fewer fresher openings.'),

  // Cybersecurity
  sub('cyber-analyst', 'pen-tester', 'Ethical Hacker (Penetration Tester)', '🕵️', 'Is paid to break into systems first, so attackers cannot.',
    fx(['₹4–11 LPA', 33], ['None; security certifications matter', 55], ['3–4 year degree in computers or IT, plus security training', 62], ['₹1.5–8 L in total', 84], ['Growing', 20]),
    [['10:00', 'Scan a client’s website for weak spots, with written permission.'], ['13:00', 'Try to get past a login using a known flaw.'], ['16:00', 'Write a report that explains how to fix each hole.']],
    'You must work only within legal permission, and reports matter as much as hacking.'),
  sub('cyber-analyst', 'soc-analyst', 'SOC Analyst', '🚨', 'Watches a company’s systems around the clock for attacks.',
    fx(['₹3.5–8 LPA', 29], ['None; entry-level certifications help', 52], ['3-year degree in computers or IT', 58], ['₹1–6 L in total', 80], ['Growing', 23]),
    [['9:00', 'Take over the alert queue from the night shift.'], ['12:00', 'Check whether a strange login is real or a false alarm.'], ['15:00', 'Isolate an infected laptop and tell its owner.']],
    'Shift work, including nights, is normal.'),

  // Chartered Accountant
  sub('ca', 'auditor', 'Auditor', '🔍', 'Checks that a company’s accounts are honest and correct.',
    fx(['₹6–10 LPA (newly qualified)', 25], ['CA Foundation (CA route)', 40], ['About 4.5–5 years including articleship', 52], ['₹1–3 L, excluding coaching', 83], ['Steady', 36]),
    [['10:00', 'Sample invoices to see whether they match the books.'], ['13:00', 'Visit a warehouse to count stock.'], ['16:00', 'Write up what looks wrong and ask the client why.']],
    'Busy seasons mean long hours, and travel to client sites is common.'),
  sub('ca', 'tax-consultant', 'Tax Consultant', '🧮', 'Helps people and companies pay the right tax, on time.',
    fx(['₹5–10 LPA', 27], ['CA Foundation (CA route)', 40], ['About 4.5–5 years including articleship', 52], ['₹1–3 L, excluding coaching', 83], ['Steady', 37]),
    [['10:00', 'File a return for a small business.'], ['13:00', 'Reply to a tax notice with the right documents.'], ['16:00', 'Explain a new rule to a worried client.']],
    'Deadlines cluster around filing dates, and the rules change every year.'),

  // Digital Marketer
  sub('digital-marketer', 'seo-specialist', 'SEO Specialist', '🌐', 'Helps a website show up when people search.',
    fx(['₹3–6 LPA', 17], ['None', 80], ['Any degree plus short courses', 47], ['₹10k–2 L in total', 69], ['Steady', 24]),
    [['10:00', 'Find what people search for before they buy.'], ['13:00', 'Rewrite a page so it answers that question clearly.'], ['16:00', 'Report which pages gained visits this month.']],
    'Search engines change their rules, so results can swing without warning.'),
  sub('digital-marketer', 'social-media-manager', 'Social Media Manager', '📲', 'Runs a brand’s pages: ideas, posts, replies and results.',
    fx(['₹2.5–6 LPA', 16], ['None', 80], ['Any degree plus short courses', 47], ['₹10k–2 L in total', 69], ['Growing', 21]),
    [['10:00', 'Plan this week’s posts with the designer.'], ['13:00', 'Reply to comments and sort out a complaint.'], ['16:00', 'See which post worked and why.']],
    'You are online most of the day, and bad days on social media can feel personal.'),
];

export const CAREERS = [...BASE, ...SUBS];
export const TOP_LEVEL = BASE;
export const CAREER_MAP = Object.fromEntries(CAREERS.map((c) => [c.id, c]));

// parent id -> its specialisations, in the order defined above.
export const CHILDREN = {};
for (const c of SUBS) (CHILDREN[c.parent] ||= []).push(c);

// Used for the counter-metric: is this one of the highest-paying roles?
export const TOP_SALARY_IDS = ['doctor', 'ca', 'software-dev', 'surgeon', 'cardiologist', 'product-manager'];

export const FIELD_KEYS = ['salary', 'exam', 'study', 'cost', 'demand'];

// Swap in content loaded from the database. The exported containers are mutated in place, so every
// module that already imported them sees the new data. The bundled data above is the seed and the
// offline fallback.
export function replaceCareers(list) {
  CAREERS.length = 0; CAREERS.push(...list);
  TOP_LEVEL.length = 0; TOP_LEVEL.push(...list.filter((c) => !c.parent));
  for (const k of Object.keys(CAREER_MAP)) delete CAREER_MAP[k];
  for (const c of list) CAREER_MAP[c.id] = c;
  for (const k of Object.keys(CHILDREN)) delete CHILDREN[k];
  for (const c of list) if (c.parent) (CHILDREN[c.parent] ||= []).push(c);
}
