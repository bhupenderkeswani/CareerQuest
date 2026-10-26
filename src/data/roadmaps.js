// Hand-curated roadmaps (US16). ILLUSTRATIVE SAMPLE: expert review required before launch.
// A step's `at` is the stage where it happens (0 = Class 11, 1 = Class 12, 2 = college onward).
// A student starting at stage N sees steps with at >= N. Cost is in thousands of rupees.
import { daysAgo } from '../lib/freshness';

export const STAGES = [
  { id: 'c11', label: 'Class 11' },
  { id: 'c12', label: 'Class 12' },
  { id: 'college', label: 'In college' },
];

const SRC = 'Course and exam notices (sample)';
const num = (v) => (Array.isArray(v) ? v : [v, v]);
const DEFAULT_TODO = ['Check the official notice for dates, fees and documents', 'Note the eligibility rules before you register'];

// st(id, title, type, months, cost[k], eligibility, at, ageInDays, todo)
const st = (id, title, type, months, cost, eligibility, at, age = 45, todo = DEFAULT_TODO) => ({
  id, title, type, dur: num(months), cost, eligibility, at, source: SRC, updated: daysAgo(age), todo,
});

const stream = (label) => st('stream', label, 'Stage', 12, null, 'Completed Class 10', 0, 60, ['Talk to a teacher or senior in this stream', 'Check which subjects the next steps need']);
const boards = (label = 'Class 12 board exams') => st('boards', label, 'Exam', 12, null, 'Enrolled in Class 12', 1, 60, ['Plan revision around the boards', 'Keep marks in mind: some courses have cut-offs']);

export const ROADMAPS = {
  ca: {
    paths: [
      {
        id: 'ca', name: 'CA',
        steps: [
          stream('Pick Commerce in Class 11'), boards('Class 12 (Commerce preferred)'),
          st('ca-foundation', 'CA Foundation', 'Exam', 4, [10, 15], 'Class 12 passed or appearing', 2, 40, ['Register on the institute’s portal', 'Pick an exam attempt window', 'Start with Accounts and Business Laws']),
          st('ca-inter', 'CA Intermediate', 'Exam', [8, 10], [25, 70], 'Cleared Foundation', 2, 52),
          st('ca-articleship', 'Articleship (practical training)', 'Training', [24, 36], null, 'Registered after Intermediate', 2, 61, ['Find a practising CA firm', 'Register your training formally']),
          st('ca-final', 'CA Final', 'Exam', [6, 8], [40, 80], 'Cleared Intermediate and training', 2, 47),
        ],
      },
      {
        id: 'cma', name: 'CMA',
        steps: [
          stream('Pick Commerce in Class 11'), boards('Class 12 (Commerce preferred)'),
          st('cma-foundation', 'CMA Foundation', 'Exam', 4, [8, 12], 'Class 12 passed or appearing', 2, 38),
          st('cma-inter', 'CMA Intermediate', 'Exam', [8, 10], [20, 40], 'Cleared Foundation', 2, 49),
          st('cma-training', 'Practical training', 'Training', 15, null, 'After Intermediate', 2, 63),
          st('cma-final', 'CMA Final', 'Exam', [6, 8], [20, 40], 'Cleared Intermediate', 2, 55),
        ],
      },
      {
        id: 'bcom-mba', name: 'B.Com + MBA',
        steps: [
          stream('Pick Commerce in Class 11'), boards('Class 12 (Commerce preferred)'),
          st('bcom', 'B.Com degree', 'Degree', 36, [30, 300], 'Class 12 passed', 2, 44),
          st('mba-entrance', 'MBA entrance exam (for example CAT, XAT)', 'Exam', [6, 12], [10, 50], 'Final-year or graduate', 2, 58),
          st('mba-fin', 'MBA / PGDM in Finance', 'Degree', 24, [200, 2500], 'Cleared entrance and interviews', 2, 66),
        ],
      },
    ],
  },
  'data-analyst': {
    paths: [
      {
        id: 'degree', name: 'Degree route',
        steps: [
          stream('Pick maths-friendly subjects in Class 11'), boards(),
          st('da-degree', 'B.Sc / BCA / B.Com degree', 'Degree', 36, [60, 400], 'Class 12 passed; maths helps', 2, 42),
          st('da-skills', 'Learn SQL, Excel and Python basics', 'Course', [6, 9], [0, 20], 'Open to all', 2, 30, ['Work through one beginner SQL course', 'Practise on free datasets']),
          st('da-portfolio', 'Build two portfolio projects', 'Project', [3, 6], null, 'Open to all', 2, 30, ['Pick a topic you care about', 'Write up what you found in plain language']),
          st('da-first-job', 'Internship or junior analyst role', 'Job', [3, 6], null, 'Degree in progress or done', 2, 120),
        ],
      },
      {
        id: 'cert', name: 'Any degree + certificate',
        steps: [
          boards(),
          st('da-any-degree', 'Any 3-year degree', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          st('da-cert', 'Data analytics certificate course', 'Course', [6, 9], [10, 100], 'Open to all', 2, 33),
          st('da-portfolio', 'Build two portfolio projects', 'Project', [3, 6], null, 'Open to all', 2, 30, ['Pick a topic you care about', 'Write up what you found in plain language']),
          st('da-first-job', 'Internship or junior analyst role', 'Job', [3, 6], null, 'Degree in progress or done', 2, 120),
        ],
      },
    ],
  },
  'software-dev': {
    paths: [
      {
        id: 'btech', name: 'B.Tech',
        steps: [
          stream('Pick Maths (and ideally Computers) in Class 11'), boards(),
          st('sd-entrance', 'Engineering entrance (for example JEE or state CET)', 'Exam', [6, 12], [5, 40], 'Class 12 with Maths', 1, 34, ['Check which exams your target colleges accept', 'Plan a preparation schedule']),
          st('sd-btech', 'B.Tech in Computer Science or IT', 'Degree', 48, [150, 1200], 'Cleared entrance', 2, 50),
          st('sd-projects', 'Build projects and do an internship', 'Project', [6, 12], null, 'During the degree', 2, 40),
        ],
      },
      {
        id: 'bca', name: 'BCA',
        steps: [
          boards(),
          st('sd-bca', 'BCA degree', 'Degree', 36, [100, 500], 'Class 12 passed (Maths preferred)', 2, 46),
          st('sd-projects', 'Build projects and do an internship', 'Project', [6, 12], null, 'During the degree', 2, 40),
          st('sd-first-job', 'Junior developer role', 'Job', [3, 6], null, 'Degree done or nearly done', 2, 100),
        ],
      },
    ],
  },
  doctor: {
    paths: [
      {
        id: 'govt', name: 'Government seat',
        steps: [
          stream('Pick Science with Biology in Class 11'), boards('Class 12 (PCB)'),
          st('doc-neet', 'NEET-UG', 'Exam', [12, 24], [10, 100], 'Class 12 with Physics, Chemistry, Biology', 1, 15, ['Read the official information bulletin', 'Plan a two-year preparation schedule']),
          st('doc-mbbs-govt', 'MBBS at a government college', 'Degree', 66, [100, 800], 'Qualified NEET-UG with a high rank', 2, 95),
          st('doc-intern', 'Compulsory rotating internship', 'Training', 12, null, 'After MBBS final exams', 2, 80),
        ],
      },
      {
        id: 'private', name: 'Private seat',
        steps: [
          stream('Pick Science with Biology in Class 11'), boards('Class 12 (PCB)'),
          st('doc-neet', 'NEET-UG', 'Exam', [12, 24], [10, 100], 'Class 12 with Physics, Chemistry, Biology', 1, 15, ['Read the official information bulletin', 'Plan a two-year preparation schedule']),
          st('doc-mbbs-pvt', 'MBBS at a private college', 'Degree', 66, [2000, 6000], 'Qualified NEET-UG and counselling', 2, 85),
          st('doc-intern', 'Compulsory rotating internship', 'Training', 12, null, 'After MBBS final exams', 2, 80),
        ],
      },
    ],
  },
  'ux-designer': {
    paths: [
      {
        id: 'bdes', name: 'B.Des',
        steps: [
          boards(),
          st('ux-entrance', 'Design entrance (for example UCEED, NID DAT)', 'Exam', [4, 8], [5, 40], 'Class 12 in any stream', 1, 100),
          st('ux-bdes', 'B.Des degree', 'Degree', 48, [200, 1500], 'Cleared entrance', 2, 60),
          st('ux-portfolio', 'Build a portfolio of 3 case studies', 'Project', [4, 8], null, 'During the degree', 2, 35),
        ],
      },
      {
        id: 'course', name: 'Any degree + UX course',
        steps: [
          boards(),
          st('ux-any', 'Any 3-year degree', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          st('ux-course', 'UX design certificate course', 'Course', [4, 8], [10, 120], 'Open to all', 2, 38),
          st('ux-portfolio', 'Build a portfolio of 3 case studies', 'Project', [4, 8], null, 'During the degree', 2, 35),
        ],
      },
    ],
  },
  nurse: {
    paths: [
      {
        id: 'bsc', name: 'B.Sc Nursing',
        steps: [
          stream('Pick Science with Biology in Class 11'), boards('Class 12 (PCB)'),
          st('nu-entrance', 'Nursing entrance (varies by state or college)', 'Exam', [2, 6], [1, 10], 'Class 12 with Biology', 1, 110),
          st('nu-bsc', 'B.Sc Nursing', 'Degree', 48, [40, 600], 'Cleared entrance', 2, 66),
          st('nu-register', 'Register with the nursing council', 'Stage', 1, [1, 3], 'After the degree', 2, 70),
        ],
      },
      {
        id: 'gnm', name: 'GNM diploma',
        steps: [
          boards('Class 12 (any stream accepted by many colleges)'),
          st('nu-gnm', 'GNM diploma', 'Degree', 40, [30, 300], 'Class 12 passed; rules vary by state', 2, 74),
          st('nu-register', 'Register with the nursing council', 'Stage', 1, [1, 3], 'After the course', 2, 70),
        ],
      },
    ],
  },
  'digital-marketer': {
    paths: [
      {
        id: 'degree', name: 'Degree + certificates',
        steps: [
          boards(),
          st('dm-degree', 'Any 3-year degree (BBA, B.Com, BA)', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 47),
          st('dm-certs', 'Short courses: SEO, ads, analytics', 'Course', [3, 6], [0, 50], 'Open to all', 2, 36, ['Take one free course from a platform', 'Run a small test campaign']),
          st('dm-intern', 'Internship with a startup or agency', 'Job', [3, 6], null, 'Open to all', 2, 60),
        ],
      },
      {
        id: 'direct', name: 'Certificates first',
        steps: [
          st('dm-certs', 'Short courses: SEO, ads, analytics', 'Course', [3, 6], [0, 50], 'Open to all', 2, 36, ['Take one free course from a platform', 'Run a small test campaign']),
          st('dm-own', 'Run your own page or blog for 3 months', 'Project', 3, null, 'Open to all', 2, 36),
          st('dm-intern', 'Internship with a startup or agency', 'Job', [3, 6], null, 'Open to all', 2, 60),
        ],
      },
    ],
  },
  pharmacist: {
    paths: [
      {
        id: 'bpharm', name: 'B.Pharm',
        steps: [
          stream('Pick Science in Class 11'), boards('Class 12 (PCM or PCB)'),
          st('ph-entrance', 'Pharmacy entrance (state or college level)', 'Exam', [2, 6], [1, 10], 'Class 12 with Science', 1, 65),
          st('ph-bpharm', 'B.Pharm degree', 'Degree', 48, [100, 800], 'Cleared entrance', 2, 58),
          st('ph-register', 'Register with the pharmacy council', 'Stage', 1, [1, 3], 'After the degree', 2, 70),
        ],
      },
      {
        id: 'dpharm', name: 'D.Pharm',
        steps: [
          boards('Class 12 (Science)'),
          st('ph-dpharm', 'D.Pharm diploma', 'Degree', 24, [30, 250], 'Class 12 with Science', 2, 60),
          st('ph-register', 'Register with the pharmacy council', 'Stage', 1, [1, 3], 'After the diploma', 2, 70),
        ],
      },
    ],
  },
};

// ---------- more top-level roadmaps ----------
const skills = (id, title, months, cost, age = 35, todo) => st(id, title, 'Course', months, cost, 'Open to all', 2, age, todo);
const project = (id, title, months = [3, 6]) => st(id, title, 'Project', months, null, 'Open to all', 2, 35, ['Pick something you would actually use', 'Put it online so others can see it']);
const firstJob = (id, title) => st(id, title, 'Job', [3, 6], null, 'Degree done or nearly done', 2, 100);

Object.assign(ROADMAPS, {
  'cyber-analyst': {
    paths: [
      {
        id: 'degree', name: 'Degree route',
        steps: [
          stream('Pick Maths or Computers in Class 11'), boards(),
          st('cy-degree', 'BCA, B.Sc or B.Tech in Computers / IT', 'Degree', [36, 48], [100, 1200], 'Class 12 passed; Maths or Computers helps', 2, 60),
          skills('cy-skills', 'Networking, Linux and security basics', [4, 8], [0, 40]),
          st('cy-cert', 'Entry-level security certification', 'Exam', [2, 4], [10, 80], 'Open to all', 2, 45),
          firstJob('cy-first-job', 'Junior security analyst role'),
        ],
      },
      {
        id: 'any', name: 'Any degree + certifications',
        steps: [
          boards(),
          st('cy-any-degree', 'Any 3-year degree', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          skills('cy-skills', 'Networking, Linux and security basics', [4, 8], [0, 40]),
          st('cy-cert', 'Entry-level security certification', 'Exam', [2, 4], [10, 80], 'Open to all', 2, 45),
          firstJob('cy-first-job', 'Junior security analyst role'),
        ],
      },
    ],
  },
  'product-manager': {
    paths: [
      {
        id: 'eng', name: 'Start in tech',
        steps: [
          boards(),
          st('pm-degree', 'B.Tech, BCA or any design / analytics degree', 'Degree', [36, 48], [100, 1200], 'Class 12 passed', 2, 50),
          st('pm-first-role', 'Work as a developer, designer or analyst', 'Job', [24, 48], null, 'Degree done', 2, 90, ['Look for roles close to product teams', 'Ask to join user calls and planning meetings']),
          st('pm-apm', 'Move into an associate PM role', 'Job', [6, 12], null, 'About 2–4 years of experience', 2, 90),
        ],
      },
      {
        id: 'mba', name: 'Any degree + MBA',
        steps: [
          boards(),
          st('pm-any-degree', 'Any 3-year degree', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          st('pm-mba-entrance', 'MBA entrance exam (for example CAT, XAT)', 'Exam', [6, 12], [10, 50], 'Final-year or graduate', 2, 58),
          st('pm-mba', 'MBA / PGDM', 'Degree', 24, [200, 2500], 'Cleared entrance and interviews', 2, 66),
          st('pm-apm-mba', 'Associate PM role', 'Job', [3, 6], null, 'MBA done', 2, 90),
        ],
      },
    ],
  },
  'data-scientist': {
    paths: [
      {
        id: 'degree', name: 'Degree + master’s',
        steps: [
          stream('Pick Maths (and ideally Computers) in Class 11'), boards(),
          st('ds-degree', 'B.Sc (Maths, Stats, CS) or B.Tech', 'Degree', [36, 48], [60, 1200], 'Class 12 with Maths', 2, 49),
          skills('ds-skills', 'Learn Python, statistics and machine learning basics', [6, 12], [0, 60]),
          project('ds-projects', 'Build three projects on real datasets'),
          st('ds-masters', 'Optional master’s in data science or statistics', 'Degree', 24, [100, 1500], 'Bachelor’s degree', 2, 70),
          firstJob('ds-first-job', 'Junior data scientist or analyst role'),
        ],
      },
      {
        id: 'self', name: 'Any numbers-heavy degree',
        steps: [
          boards(),
          st('ds-any-degree', 'Degree in maths, stats, economics or computers', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          skills('ds-skills', 'Learn Python, statistics and machine learning basics', [6, 12], [0, 60]),
          project('ds-projects', 'Build three projects on real datasets'),
          firstJob('ds-first-job', 'Junior data scientist or analyst role'),
        ],
      },
    ],
  },
  'devops-engineer': {
    paths: [
      {
        id: 'degree', name: 'Degree route',
        steps: [
          boards(),
          st('do-degree', 'BCA or B.Tech in IT / Computer Science', 'Degree', [36, 48], [100, 1200], 'Class 12 passed', 2, 55),
          skills('do-skills', 'Linux, networking and cloud basics', [4, 8], [0, 30]),
          st('do-cert', 'Entry-level cloud certification', 'Exam', [2, 4], [5, 30], 'Open to all', 2, 40),
          firstJob('do-first-job', 'Junior cloud or DevOps role'),
        ],
      },
      {
        id: 'any', name: 'Any degree + certifications',
        steps: [
          boards(),
          st('do-any-degree', 'Any 3-year degree', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          skills('do-skills', 'Linux, networking and cloud basics', [4, 8], [0, 30]),
          st('do-cert', 'Entry-level cloud certification', 'Exam', [2, 4], [5, 30], 'Open to all', 2, 40),
          firstJob('do-first-job', 'Junior cloud or DevOps role'),
        ],
      },
    ],
  },
  'qa-engineer': {
    paths: [
      {
        id: 'degree', name: 'BCA / B.Tech',
        steps: [
          boards(),
          st('qa-degree', 'BCA or B.Tech', 'Degree', [36, 48], [100, 1200], 'Class 12 passed', 2, 52),
          skills('qa-course', 'Software testing course', [2, 4], [5, 40]),
          skills('qa-auto', 'Learn test automation basics', [2, 4], [0, 30]),
          firstJob('qa-first-job', 'Junior QA role'),
        ],
      },
      {
        id: 'direct', name: 'Any degree + course',
        steps: [
          boards(),
          st('qa-any-degree', 'Any 3-year degree', 'Degree', 36, [50, 400], 'Class 12 passed', 2, 42),
          skills('qa-course', 'Software testing course', [2, 4], [5, 40]),
          project('qa-practice', 'Test a real app and write up the bugs you found', [1, 3]),
          firstJob('qa-first-job', 'Junior QA role'),
        ],
      },
    ],
  },
  dentist: {
    paths: [
      {
        id: 'govt', name: 'Government seat',
        steps: [
          stream('Pick Science with Biology in Class 11'), boards('Class 12 (PCB)'),
          st('doc-neet', 'NEET-UG', 'Exam', [12, 24], [10, 100], 'Class 12 with Physics, Chemistry, Biology', 1, 28, ['Read the official information bulletin', 'Check the BDS seat counselling rules']),
          st('den-bds-govt', 'BDS at a government dental college', 'Degree', 60, [60, 400], 'Qualified NEET-UG with a high rank', 2, 85),
          st('den-mds', 'Optional: MDS to become a specialist', 'Degree', 36, [200, 3500], 'BDS done and a qualifying NEET-MDS rank', 2, 90),
        ],
      },
      {
        id: 'private', name: 'Private seat',
        steps: [
          stream('Pick Science with Biology in Class 11'), boards('Class 12 (PCB)'),
          st('doc-neet', 'NEET-UG', 'Exam', [12, 24], [10, 100], 'Class 12 with Physics, Chemistry, Biology', 1, 28, ['Read the official information bulletin', 'Check the BDS seat counselling rules']),
          st('den-bds-pvt', 'BDS at a private dental college', 'Degree', 60, [1500, 4500], 'Qualified NEET-UG and counselling', 2, 80),
          st('den-mds', 'Optional: MDS to become a specialist', 'Degree', 36, [200, 3500], 'BDS done and a qualifying NEET-MDS rank', 2, 90),
        ],
      },
    ],
  },
});

// ---------- specialisation roadmaps ----------
// A specialisation shares its parent's steps, then adds its own at the end.
const extend = (parentId, extra) => ({
  paths: ROADMAPS[parentId].paths.map((p) => ({ ...p, steps: [...p.steps, ...extra] })),
});
const neetPg = st('doc-neetpg', 'NEET-PG', 'Exam', [6, 12], [5, 30], 'MBBS and internship completed', 2, 20, ['Check the counselling rules for government and private seats', 'Plan your preparation during internship']);
const pg = (id, title, cost = [200, 10000]) => st(id, title, 'Degree', 36, cost, 'Qualified NEET-PG with a suitable rank', 2, 70);

Object.assign(ROADMAPS, {
  gp: extend('doctor', [st('gp-practice', 'Join a clinic or hospital, or start practice', 'Job', [3, 6], null, 'Registered medical practitioner', 2, 50)]),
  surgeon: extend('doctor', [neetPg, pg('doc-ms-surg', 'MS in General Surgery')]),
  paediatrician: extend('doctor', [neetPg, pg('doc-md-paeds', 'MD in Paediatrics')]),
  dermatologist: extend('doctor', [neetPg, pg('doc-md-derm', 'MD in Dermatology')]),
  psychiatrist: extend('doctor', [neetPg, pg('doc-md-psych', 'MD in Psychiatry')]),
  radiologist: extend('doctor', [neetPg, pg('doc-md-radio', 'MD in Radiodiagnosis')]),
  cardiologist: extend('doctor', [
    neetPg, pg('doc-md-med', 'MD in General Medicine'),
    st('doc-neetss', 'NEET-SS', 'Exam', [6, 12], [5, 30], 'MD completed', 2, 35),
    st('doc-dm-cardio', 'DM in Cardiology', 'Degree', 36, [300, 12000], 'Qualified NEET-SS with a suitable rank', 2, 75),
  ]),

  'frontend-dev': extend('software-dev', [
    skills('fe-skills', 'HTML, CSS, JavaScript and a framework such as React', [4, 8], [0, 30]),
    project('fe-portfolio', 'Build three real websites or web apps'),
  ]),
  'backend-dev': extend('software-dev', [
    skills('be-skills', 'A backend language, databases and APIs', [4, 8], [0, 30]),
    project('be-portfolio', 'Build an API with a database and put it online'),
  ]),
  'mobile-dev': extend('software-dev', [
    skills('mob-skills', 'Android (Kotlin) or iOS (Swift) basics', [4, 8], [0, 30]),
    project('mob-portfolio', 'Publish one app to a store'),
  ]),
  'game-dev': extend('software-dev', [
    skills('game-skills', 'A game engine such as Unity, plus C# or C++', [6, 12], [0, 40]),
    project('game-portfolio', 'Finish and publish two small games', [4, 8]),
  ]),

  'ui-designer': extend('ux-designer', [
    skills('ui-skills', 'Visual design, typography and Figma', [3, 6], [0, 40]),
    project('ui-portfolio', 'Redesign three real apps as portfolio pieces'),
  ]),
  'ux-researcher': extend('ux-designer', [
    skills('uxr-skills', 'Research methods: interviews, surveys and usability tests', [3, 6], [0, 40]),
    project('uxr-portfolio', 'Run two small research studies and write them up'),
  ]),
  'graphic-designer': extend('ux-designer', [
    skills('gd-skills', 'Design tools, branding and layout basics', [3, 6], [0, 40]),
    project('gd-portfolio', 'Build a portfolio of 8–10 pieces'),
  ]),

  'business-analyst': extend('data-analyst', [
    skills('ba-skills', 'Requirements gathering, SQL and process mapping', [3, 6], [0, 40]),
    project('ba-case', 'Write up two business case studies'),
  ]),
  'data-engineer': extend('data-analyst', [
    skills('de-skills', 'Python, SQL and building data pipelines', [4, 8], [0, 40]),
    project('de-portfolio', 'Build a pipeline that loads and cleans real data'),
  ]),
  'ml-engineer': extend('data-scientist', [
    skills('ml-skills', 'Deep learning and putting models into production', [6, 12], [0, 60]),
    project('ml-projects', 'Deploy a model as a working app'),
  ]),

  'pen-tester': extend('cyber-analyst', [
    skills('pt-skills', 'Networking, Linux and ethical hacking basics', [4, 8], [0, 40]),
    st('pt-cert', 'Entry-level security certification', 'Exam', [2, 4], [10, 80], 'Open to all', 2, 45),
  ]),
  'soc-analyst': extend('cyber-analyst', [
    skills('soc-skills', 'Security monitoring tools and incident handling', [3, 6], [0, 40]),
    st('soc-cert', 'Entry-level security certification', 'Exam', [2, 4], [10, 80], 'Open to all', 2, 45),
  ]),

  auditor: extend('ca', [st('aud-job', 'Join an audit firm after qualifying', 'Job', [3, 6], null, 'Qualified CA', 2, 60)]),
  'tax-consultant': extend('ca', [skills('tax-skills', 'Direct and indirect tax: short specialisation courses', [3, 6], [10, 60])]),

  'seo-specialist': extend('digital-marketer', [skills('seo-skills', 'SEO tools and writing for search', [2, 4], [0, 30]), project('seo-site', 'Grow a small site’s search visits for 3 months')]),
  'social-media-manager': extend('digital-marketer', [skills('smm-skills', 'Social media strategy and content creation', [2, 4], [0, 30]), project('smm-page', 'Run a page for 3 months and track results')]),
});

export const hasRoadmap = (id) => Boolean(ROADMAPS[id]);

// The steps a student sees from their starting stage, for one alternate path.
export function visibleSteps(roleId, pathId, startIdx) {
  const rm = ROADMAPS[roleId];
  if (!rm) return [];
  const path = rm.paths.find((p) => p.id === pathId) || rm.paths[0];
  return path.steps.filter((s) => s.at >= startIdx);
}

export function pathTotals(steps) {
  let dMin = 0, dMax = 0, cMin = 0, cMax = 0;
  for (const s of steps) {
    // Entrance-exam prep that happens alongside school is not added on top of schooling time.
    const parallel = s.type === 'Exam' && s.at <= 1 && s.id !== 'boards';
    if (!parallel) { dMin += s.dur[0]; dMax += s.dur[1]; }
    if (s.cost) { cMin += s.cost[0]; cMax += s.cost[1]; }
  }
  return { dMin, dMax, cMin, cMax };
}

export function findStep(roleId, stepId) {
  const rm = ROADMAPS[roleId];
  if (!rm) return null;
  for (const p of rm.paths) {
    const s = p.steps.find((x) => x.id === stepId);
    if (s) return { step: s, path: p };
  }
  return null;
}

// Every distinct step id in a role's roadmap (shared steps count once).
export function allStepIds(roleId) {
  const ids = new Set();
  (ROADMAPS[roleId]?.paths || []).forEach((p) => p.steps.forEach((s) => ids.add(s.id)));
  return [...ids];
}

// See replaceCareers: swap in database content without breaking existing imports.
export function replaceRoadmaps(next) {
  for (const k of Object.keys(ROADMAPS)) delete ROADMAPS[k];
  Object.assign(ROADMAPS, next);
}
