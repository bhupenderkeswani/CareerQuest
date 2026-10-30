// Career ladders: how a role grows after the first job (the roadmap covers how to get in).
// ILLUSTRATIVE SAMPLE: titles, timing and pay differ a lot by company, and every figure needs
// review before launch. Each level's pay carries its own source and last_updated (US17).
//
// A ladder has one or more tracks. Tracks share their early levels and split where careers
// really fork (for example specialist vs people leadership), like alternate roadmap paths.
import { daysAgo } from '../lib/freshness';
import { CAREER_MAP } from './careers';
import { UNVERIFIED_SOURCE } from './verified';

const SRC = UNVERIFIED_SOURCE;
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// L(title, when, pay, ageInDays, does, skills[], moveUp)
const L = (title, when, pay, age, does, skills, moveUp) => ({
  id: slug(title), title, when, does, skills, moveUp,
  pay: { label: 'Typical pay', value: pay, source: SRC, updated: daysAgo(age) },
});

// ladder(common, [id, name, extraLevels], ...): every track = common levels + its own.
const ladder = (common, ...tracks) => ({
  tracks: (tracks.length ? tracks : [['main', 'Main path', []]]).map(([id, name, extra]) => ({ id, name, levels: [...common, ...extra] })),
});

const SPEC = 'Specialist track';
const LEAD = 'Leadership track';

export const LADDERS = {
  'product-manager': ladder(
    [
      L('Associate Product Manager', '0–2 years in the role', '₹10–18 LPA', 18, 'Own a small feature, write specs and work with engineers and designers.', ['Writing clear specs', 'Talking to users', 'Basic metrics'], 'Ship a feature end to end and show it moved a number.'),
      L('Product Manager', '2–5 years', '₹18–35 LPA', 18, 'Own a product area: decide what to build, why, and in what order.', ['Prioritising', 'Running experiments', 'Handling stakeholders'], 'Own a product area that grows, and make others on the team better.'),
      L('Senior Product Manager', '5–8 years', '₹35–60 LPA', 22, 'Lead the strategy for a large product and mentor other PMs.', ['Product strategy', 'Influencing without authority', 'Mentoring'], 'Pick a direction: go deeper as a specialist, or lead people.'),
    ],
    ['spec', SPEC, [L('Principal Product Manager', '8–12 years', '₹55–90 LPA', 30, 'Set the product direction for a whole business line without managing a big team.', ['Strategy', 'Market sense', 'Deep domain knowledge'], 'Show repeated results across several launches.')]],
    ['lead', LEAD, [
      L('Group Product Manager', '8–11 years', '₹55–90 LPA', 30, 'Manage several PMs and the products they own.', ['Hiring', 'Coaching', 'Planning across teams'], 'Build a team that delivers without you in every meeting.'),
      L('Director of Product', '11–15 years', '₹80 L–1.5 Cr', 45, 'Own the product plan for a business and answer to the top leadership.', ['Business strategy', 'Budgeting', 'Leadership'], 'Show business results, not just launches.'),
    ]],
  ),

  'software-dev': ladder(
    [
      L('Junior Software Engineer', '0–2 years', '₹4–12 LPA', 20, 'Fix bugs and build small features with guidance.', ['One language well', 'Git and code review', 'Debugging'], 'Work independently on a feature from start to finish.'),
      L('Software Engineer', '2–5 years', '₹12–30 LPA', 20, 'Own features and services, and review others’ code.', ['System basics', 'Testing', 'Clear communication'], 'Design a system, not just write code for one.'),
      L('Senior Software Engineer', '5–8 years', '₹25–50 LPA', 24, 'Design larger systems and guide the team’s technical choices.', ['System design', 'Mentoring', 'Trade-offs'], 'Pick a direction: go deeper technically or lead people.'),
    ],
    ['spec', SPEC, [
      L('Staff Engineer', '8–12 years', '₹45–90 LPA', 34, 'Solve the hardest cross-team technical problems.', ['Architecture', 'Influence', 'Writing design docs'], 'Show impact across many teams.'),
      L('Principal Engineer', '12+ years', '₹80 L–1.5 Cr', 50, 'Set the technical direction for the whole company.', ['Vision', 'Industry depth', 'Teaching'], 'Reached by a small number of engineers.'),
    ]],
    ['lead', LEAD, [
      L('Engineering Manager', '7–11 years', '₹40–80 LPA', 30, 'Grow a team, plan delivery and keep people happy and productive.', ['Hiring', 'Feedback', 'Planning'], 'Deliver through your team and grow the people in it.'),
      L('Director of Engineering', '12+ years', '₹80 L–1.5 Cr', 45, 'Lead several teams and tie technology to business goals.', ['Org design', 'Budgeting', 'Strategy'], 'Show results across a whole organisation.'),
    ]],
  ),

  'ux-designer': ladder(
    [
      L('Junior Designer', '0–2 years', '₹4–10 LPA', 19, 'Design screens and flows with guidance from a senior.', ['Figma', 'Layout and type', 'Taking feedback'], 'Own a design from brief to launch.'),
      L('Product Designer', '2–4 years', '₹10–20 LPA', 19, 'Own the design of a product area, from research to final screens.', ['User research', 'Prototyping', 'Working with engineers'], 'Show your designs improved a real measure.'),
      L('Senior Designer', '4–7 years', '₹18–35 LPA', 26, 'Lead design on large projects and mentor juniors.', ['Systems thinking', 'Storytelling', 'Mentoring'], 'Choose between craft depth and leading a team.'),
    ],
    ['spec', SPEC, [L('Staff / Principal Designer', '7–12 years', '₹35–70 LPA', 38, 'Shape design direction across products.', ['Strategy', 'Design systems', 'Influence'], 'Show impact beyond one product.')]],
    ['lead', LEAD, [
      L('Design Manager', '7–10 years', '₹35–60 LPA', 32, 'Lead a design team and its quality.', ['Hiring', 'Critique', 'Planning'], 'Build a team others want to join.'),
      L('Head of Design', '12+ years', '₹60 L–1.2 Cr', 48, 'Own design for the company and sit with leadership.', ['Vision', 'Business sense', 'Leadership'], 'Show design driving business results.'),
    ]],
  ),

  'data-analyst': ladder(
    [
      L('Junior Data Analyst', '0–2 years', '₹4–9 LPA', 14, 'Build reports and clean data for the team.', ['SQL', 'Excel', 'Charts'], 'Answer a business question on your own.'),
      L('Data Analyst', '2–4 years', '₹8–16 LPA', 14, 'Find what is driving the numbers and recommend what to do.', ['Statistics', 'Storytelling with data', 'A BI tool'], 'Influence a real decision with your analysis.'),
      L('Senior Data Analyst', '4–7 years', '₹15–28 LPA', 22, 'Lead analyses for a whole function and guide juniors.', ['Experiment design', 'Stakeholder skills', 'Mentoring'], 'Choose between deep specialist work and managing analysts.'),
    ],
    ['spec', SPEC, [L('Lead / Principal Analyst', '7–10 years', '₹25–45 LPA', 30, 'Own the hardest analyses and set methods for others.', ['Advanced stats', 'Domain depth', 'Teaching'], 'Show your work changed company strategy.')]],
    ['lead', LEAD, [
      L('Analytics Manager', '6–9 years', '₹25–45 LPA', 28, 'Lead a team of analysts and their roadmap.', ['Hiring', 'Planning', 'Prioritising requests'], 'Run a team that is trusted by the business.'),
      L('Head of Analytics', '10+ years', '₹45–90 LPA', 40, 'Decide how the whole company uses data.', ['Strategy', 'Budgeting', 'Leadership'], 'Show data driving company-wide results.'),
    ]],
  ),

  'data-scientist': ladder(
    [
      L('Junior Data Scientist', '0–2 years', '₹6–15 LPA', 21, 'Build and test simple models under guidance.', ['Python', 'Statistics', 'Model basics'], 'Ship a model that a team really uses.'),
      L('Data Scientist', '2–5 years', '₹15–35 LPA', 21, 'Own models from idea to a measured result.', ['Experiment design', 'Feature work', 'Communication'], 'Show a model improved a business measure.'),
      L('Senior Data Scientist', '5–8 years', '₹30–55 LPA', 28, 'Lead hard modelling problems and mentor others.', ['Modelling depth', 'Problem framing', 'Mentoring'], 'Choose between research depth and leading people.'),
    ],
    ['spec', SPEC, [L('Staff / Principal Data Scientist', '8+ years', '₹50–90 LPA', 36, 'Set the modelling approach for several teams.', ['Research depth', 'Strategy', 'Influence'], 'Show work that changed the company’s direction.')]],
    ['lead', LEAD, [
      L('Data Science Manager', '7–10 years', '₹45–80 LPA', 32, 'Lead a team of data scientists.', ['Hiring', 'Planning', 'Coaching'], 'Deliver through your team.'),
      L('Head of Data Science', '12+ years', '₹80 L–1.5 Cr', 46, 'Own data science for the company.', ['Strategy', 'Budgeting', 'Leadership'], 'Show business-wide results.'),
    ]],
  ),

  'cyber-analyst': ladder(
    [
      L('Junior Security Analyst', '0–2 years', '₹4–10 LPA', 30, 'Watch alerts and handle routine incidents.', ['Networking', 'Logs', 'Incident basics'], 'Handle an incident from start to end.'),
      L('Security Analyst', '2–4 years', '₹9–18 LPA', 30, 'Investigate threats and improve defences.', ['Threat hunting', 'Scripting', 'Forensics basics'], 'Lead an investigation and fix its root cause.'),
      L('Senior Security Engineer', '4–7 years', '₹18–35 LPA', 33, 'Design protections and lead response to serious attacks.', ['Security design', 'Cloud security', 'Mentoring'], 'Choose between deep technical work and managing a team.'),
    ],
    ['spec', SPEC, [L('Principal Security Architect', '8+ years', '₹35–70 LPA', 40, 'Design how the whole company stays secure.', ['Architecture', 'Risk', 'Influence'], 'Show a lasting effect on company risk.')]],
    ['lead', LEAD, [
      L('Security Manager', '7–10 years', '₹35–65 LPA', 36, 'Lead the security team and its plan.', ['Hiring', 'Risk management', 'Reporting'], 'Run a team trusted by leadership.'),
      L('Chief Information Security Officer', '12+ years', '₹70 L–1.5 Cr', 50, 'Own security for the company and report to the top.', ['Strategy', 'Regulation', 'Leadership'], 'Reached by a small number of security leaders.'),
    ]],
  ),

  'devops-engineer': ladder(
    [
      L('Junior DevOps Engineer', '0–2 years', '₹5–12 LPA', 27, 'Support deployments and monitor systems.', ['Linux', 'Scripting', 'One cloud platform'], 'Automate a task that the team did by hand.'),
      L('DevOps Engineer', '2–5 years', '₹12–28 LPA', 27, 'Build deployment pipelines and keep services reliable.', ['Infrastructure as code', 'Monitoring', 'Containers'], 'Own reliability for a service.'),
      L('Senior DevOps / SRE', '5–8 years', '₹25–45 LPA', 31, 'Design reliable platforms and lead incident response.', ['Reliability design', 'Cost control', 'Mentoring'], 'Choose between architecture and managing a team.'),
    ],
    ['spec', SPEC, [L('Staff SRE / Cloud Architect', '8+ years', '₹40–80 LPA', 40, 'Design the cloud setup for the whole company.', ['Architecture', 'Scale', 'Influence'], 'Show a platform other teams depend on.')]],
    ['lead', LEAD, [L('Platform Engineering Manager', '7–10 years', '₹40–75 LPA', 36, 'Lead the team that builds the company’s platform.', ['Hiring', 'Roadmaps', 'Stakeholders'], 'Deliver a platform other teams love to use.')]],
  ),

  'qa-engineer': ladder(
    [
      L('QA Engineer', '0–2 years', '₹3–7 LPA', 23, 'Test features by hand and report bugs clearly.', ['Test cases', 'Bug reports', 'Attention to detail'], 'Start automating the tests you run by hand.'),
      L('Senior QA / SDET', '2–5 years', '₹7–18 LPA', 23, 'Write automated tests and own quality for a product area.', ['Test automation', 'Coding', 'CI pipelines'], 'Own quality for a whole product.'),
      L('QA Lead', '5–8 years', '₹16–30 LPA', 30, 'Plan testing for big releases and guide the QA team.', ['Test strategy', 'Mentoring', 'Risk thinking'], 'Choose between test architecture and managing people.'),
    ],
    ['spec', SPEC, [L('Test Architect', '8+ years', '₹28–50 LPA', 38, 'Design how the whole company tests software.', ['Frameworks', 'Tooling', 'Influence'], 'Show test design that other teams reuse.')]],
    ['lead', LEAD, [
      L('QA Manager', '8–11 years', '₹28–50 LPA', 34, 'Lead the QA function.', ['Hiring', 'Planning', 'Reporting'], 'Run a team trusted to catch what matters.'),
      L('Head of Quality', '12+ years', '₹45–80 LPA', 44, 'Own quality for the company.', ['Strategy', 'Budgeting', 'Leadership'], 'Show quality as a business advantage.'),
    ]],
  ),

  // After MBBS. A specialisation shares this ladder unless it has its own.
  doctor: ladder(
    [
      L('Medical Intern', 'About 1 year', 'Stipend of about ₹20–35k a month', 40, 'Rotate through departments and treat patients under supervision.', ['Clinical basics', 'Talking to patients', 'Teamwork'], 'Finish the internship and register with the medical council.'),
      L('Junior Resident (PG trainee)', 'About 3 years', 'Stipend of about ₹60k–1.2 L a month', 40, 'Train in your specialisation while treating patients on the ward.', ['Specialist skills', 'Night duty stamina', 'Research basics'], 'Clear the postgraduate exams.'),
      L('Senior Resident', 'About 3 years', '₹12–20 LPA', 36, 'Run wards and clinics with more independence and teach juniors.', ['Decision-making', 'Teaching', 'Procedures'], 'Show you can handle cases on your own.'),
      L('Consultant / Specialist', 'Years 7–12 after MBBS', '₹18–45 LPA', 30, 'Treat patients independently and lead your cases.', ['Judgement', 'Communication', 'Ethics'], 'Choose between a hospital career and your own practice.'),
    ],
    ['hospital', 'Hospital career', [
      L('Senior Consultant', 'Years 12–18', '₹35–80 LPA', 35, 'Lead complex cases and train consultants.', ['Complex cases', 'Teaching', 'Leadership'], 'Build a reputation in your field.'),
      L('Head of Department', 'Years 18+', '₹50 L–1.2 Cr', 45, 'Run a department, its budget and its doctors.', ['Management', 'Quality', 'Planning'], 'Seats are few, so experience and reputation both matter.'),
    ]],
    ['practice', 'Own practice', [
      L('Own clinic or nursing home', 'Years 10+', 'Varies widely, about ₹30 L–1 Cr+', 110, 'Run your own practice, staff and finances.', ['Business basics', 'Patient trust', 'Hiring'], 'Income depends on location, speciality and years of reputation.'),
    ]],
  ),

  nurse: ladder(
    [
      L('Staff Nurse', '0–3 years', '₹2.5–5 LPA', 33, 'Give care, medicines and updates to patients on a ward.', ['Patient care', 'Charting', 'Calm under pressure'], 'Build experience in one area, like ICU or the operation theatre.'),
      L('Senior Staff Nurse', '3–6 years', '₹4–7 LPA', 33, 'Handle complex patients and guide new nurses.', ['Critical care', 'Mentoring', 'Documentation'], 'Choose between clinical specialisation and supervision.'),
    ],
    ['spec', 'Clinical specialist track', [
      L('Specialist Nurse (ICU, OT, dialysis)', '5–10 years', '₹5–9 LPA', 38, 'Work in a specialised unit with advanced skills.', ['Specialist skills', 'Equipment', 'Teaching'], 'Add a specialist certificate or diploma.'),
      L('Nurse Educator', '8+ years', '₹6–10 LPA', 45, 'Train nursing students and staff.', ['Teaching', 'Curriculum', 'Assessment'], 'Usually needs a postgraduate qualification.'),
    ]],
    ['lead', LEAD, [
      L('Nursing Supervisor', '6–10 years', '₹6–10 LPA', 36, 'Run a shift or ward and manage nurses.', ['Scheduling', 'Conflict handling', 'Quality'], 'Show you can run a ward smoothly.'),
      L('Nursing Superintendent / Matron', '10+ years', '₹9–15 LPA', 48, 'Lead all nursing in a hospital.', ['Management', 'Budgeting', 'Standards'], 'A senior role with few openings.'),
    ]],
  ),

  physio: ladder(
    [
      L('Junior Physiotherapist', '0–2 years', '₹2.5–5 LPA', 41, 'Treat patients with set plans, under a senior.', ['Assessment', 'Exercise plans', 'Manual therapy'], 'Handle your own caseload.'),
      L('Physiotherapist', '2–5 years', '₹4–8 LPA', 41, 'Plan and run treatment for your own patients.', ['Clinical reasoning', 'Patient motivation', 'Records'], 'Develop a specialty such as sports or neuro.'),
      L('Senior / Specialist Physiotherapist', '5–8 years', '₹6–12 LPA', 44, 'Handle complex cases in a specialty and guide juniors.', ['Specialist skills', 'Mentoring', 'Research reading'], 'Choose between running a clinic and leading in a hospital.'),
    ],
    ['clinic', 'Own clinic', [L('Clinic owner', '6+ years', 'Varies widely with location and patients', 60, 'Run your own physiotherapy clinic.', ['Business basics', 'Marketing', 'Hiring'], 'Needs savings and time to build patients.')]],
    ['hospital', 'Hospital leadership', [L('Head of Rehabilitation', '9+ years', '₹10–18 LPA', 48, 'Lead the rehab department of a hospital.', ['Management', 'Quality', 'Planning'], 'Few openings, so experience and further study help.')]],
  ),

  pharmacist: ladder(
    [
      L('Pharmacist', '0–2 years', '₹2.5–5 LPA', 38, 'Check prescriptions and advise patients on medicines.', ['Drug knowledge', 'Accuracy', 'Counselling'], 'Pick a setting: hospital, industry or your own shop.'),
      L('Senior Pharmacist', '2–5 years', '₹4–7 LPA', 38, 'Handle complex prescriptions and supervise juniors.', ['Clinical checks', 'Stock control', 'Mentoring'], 'Build a specialty or take on responsibility.'),
    ],
    ['hospital', 'Hospital', [L('Clinical / Chief Pharmacist', '5–10 years', '₹6–12 LPA', 44, 'Guide medicine use across a hospital.', ['Clinical pharmacy', 'Safety', 'Management'], 'Often needs a postgraduate degree.')]],
    ['industry', 'Pharma industry', [
      L('Quality or Regulatory Officer', '3–7 years', '₹5–10 LPA', 40, 'Make sure medicines meet legal and quality rules.', ['Regulations', 'Documentation', 'Audits'], 'Show careful, accurate work on audits.'),
      L('Manager, Quality or Regulatory', '8+ years', '₹10–20 LPA', 50, 'Lead the team that keeps products compliant.', ['Management', 'Regulation depth', 'Planning'], 'Experience across several audits.'),
    ]],
    ['own', 'Own pharmacy', [L('Pharmacy owner', '5+ years', 'Varies widely with location and stock', 120, 'Run your own pharmacy and stock.', ['Business basics', 'Supplier deals', 'Licences'], 'Needs a licence and starting money.')]],
  ),

  ca: ladder(
    [
      L('Newly Qualified CA', '0–2 years', '₹7–12 LPA', 26, 'Work on audits, tax or accounts under seniors.', ['Accounting standards', 'Tax basics', 'Excel'], 'Show accuracy and ownership on assignments.'),
      L('Manager', '2–5 years', '₹12–25 LPA', 28, 'Lead assignments and manage juniors and clients.', ['Client handling', 'Review skills', 'Planning'], 'Handle clients without constant guidance.'),
      L('Senior Manager', '5–8 years', '₹22–40 LPA', 30, 'Own a client portfolio and bring in new work.', ['Business development', 'Risk', 'Mentoring'], 'Choose between firm partnership and a career in industry.'),
    ],
    ['firm', 'Firm track', [L('Partner / Director', '10+ years', '₹60 L–2 Cr+', 55, 'Share in the ownership of the firm and win clients.', ['Business development', 'Reputation', 'Leadership'], 'Needs a client base and years of trust.')]],
    ['industry', 'Industry track', [
      L('Finance Controller', '8–12 years', '₹40–80 LPA', 40, 'Run accounts and reporting for a company.', ['Reporting', 'Controls', 'Team leadership'], 'Show you can run the books of a whole business.'),
      L('Chief Financial Officer', '15+ years', '₹70 L–2 Cr+', 60, 'Lead finance and advise the top leadership.', ['Strategy', 'Funding', 'Leadership'], 'Reached by a small number of finance leaders.'),
    ]],
  ),

  'digital-marketer': ladder(
    [
      L('Marketing Executive', '0–2 years', '₹3–7 LPA', 15, 'Run campaigns, post content and report results.', ['One channel well', 'Analytics basics', 'Writing'], 'Own a channel and show its results.'),
      L('Marketing Specialist', '2–4 years', '₹6–12 LPA', 15, 'Plan and improve campaigns on your own.', ['Testing', 'Budgets', 'Tools'], 'Grow a channel measurably.'),
      L('Senior Marketing Manager', '4–7 years', '₹12–22 LPA', 24, 'Lead the plan across channels and mentor others.', ['Strategy', 'Team skills', 'Reporting'], 'Choose between channel depth and leading a team.'),
    ],
    ['spec', SPEC, [L('Head of Growth / Performance', '7–10 years', '₹22–45 LPA', 32, 'Own growth numbers for the business.', ['Experiments', 'Analytics', 'Budget control'], 'Show repeated growth results.')]],
    ['lead', LEAD, [
      L('Marketing Director', '9–13 years', '₹35–70 LPA', 38, 'Lead all marketing and its team.', ['Brand', 'Budgeting', 'Leadership'], 'Show marketing driving revenue.'),
      L('Chief Marketing Officer', '14+ years', '₹70 L–1.5 Cr', 50, 'Own marketing and brand for the company.', ['Strategy', 'Brand', 'Leadership'], 'Reached by a small number of leaders.'),
    ]],
  ),

  'financial-analyst': ladder(
    [
      L('Financial Analyst', '0–2 years', '₹5–10 LPA', 19, 'Build models and reports for a team or client.', ['Excel modelling', 'Accounting', 'Writing up findings'], 'Own a model or report on your own.'),
      L('Senior Financial Analyst', '2–4 years', '₹9–18 LPA', 19, 'Lead analyses and advise on decisions.', ['Valuation', 'Forecasting', 'Presenting'], 'Influence a real decision.'),
      L('Associate / Finance Manager', '4–7 years', '₹18–35 LPA', 27, 'Manage analysts and own results for a unit.', ['Management', 'Planning', 'Stakeholders'], 'Choose between investing and company finance leadership.'),
    ],
    ['invest', 'Investment track', [L('Portfolio Manager', '8+ years', '₹35 L–1.2 Cr', 45, 'Make investment decisions for a fund or client.', ['Markets', 'Risk', 'Judgement'], 'Needs a strong, checkable record.')]],
    ['lead', 'Finance leadership', [
      L('Finance Director', '10–15 years', '₹45–90 LPA', 42, 'Lead finance for a business unit.', ['Strategy', 'Budgeting', 'Leadership'], 'Show business-wide results.'),
      L('Chief Financial Officer', '15+ years', '₹70 L–2 Cr+', 60, 'Lead finance and advise the top leadership.', ['Funding', 'Strategy', 'Leadership'], 'Reached by a small number of finance leaders.'),
    ]],
  ),

  'hr-manager': ladder(
    [
      L('HR Executive', '0–2 years', '₹3.5–7 LPA', 29, 'Handle hiring paperwork, onboarding and queries.', ['Communication', 'HR rules', 'Organising'], 'Handle a process end to end.'),
      L('HR Business Partner', '3–6 years', '₹7–15 LPA', 29, 'Work with a business team on hiring and people issues.', ['Advising managers', 'Conflict handling', 'Data basics'], 'Be trusted by the managers you support.'),
      L('HR Manager', '6–10 years', '₹14–25 LPA', 32, 'Run HR for a unit and manage the HR team.', ['Policy', 'Leadership', 'Planning'], 'Choose between broad HR leadership and a specialty.'),
    ],
    ['lead', 'Generalist leadership', [
      L('HR Director', '10–15 years', '₹30–60 LPA', 40, 'Lead HR across a business.', ['Strategy', 'Culture', 'Leadership'], 'Show people results tied to business goals.'),
      L('Chief Human Resources Officer', '15+ years', '₹60 L–1.5 Cr', 55, 'Own people strategy for the company.', ['Strategy', 'Culture', 'Leadership'], 'Reached by a small number of HR leaders.'),
    ]],
    ['spec', SPEC, [L('Head of Talent Acquisition or Compensation', '8–12 years', '₹25–50 LPA', 38, 'Own hiring or pay design for the company.', ['Deep specialism', 'Data', 'Negotiation'], 'Show a lasting effect on hiring or pay quality.')]],
  ),

  // Own ladders where a specialisation does not follow its parent's.
  dentist: ladder(
    [
      L('Associate Dentist', '0–3 years', '₹3–8 LPA', 34, 'Treat patients in someone else’s clinic or a hospital.', ['Clinical skill', 'Patient comfort', 'Hygiene and safety'], 'Build experience and a base of patients.'),
    ],
    ['own', 'Own clinic', [
      L('Clinic owner', '3–8 years', 'Varies widely with location and patients', 60, 'Run your own dental clinic.', ['Business basics', 'Equipment', 'Hiring'], 'Needs money to set up and time to build patients.'),
      L('Multi-clinic owner', '8+ years', 'Varies widely', 105, 'Run several clinics with other dentists.', ['Management', 'Brand', 'Finance'], 'Needs a proven first clinic.'),
    ]],
    ['specialist', 'Specialist (MDS)', [
      L('Specialist Dentist', '3–8 years after BDS (including MDS)', '₹8–20 LPA', 45, 'Focus on a field such as braces, root canals or gum surgery.', ['Specialist skills', 'Referrals', 'Precision'], 'Needs NEET-MDS and 3 years of study.'),
      L('Professor / Head of Department', '10+ years', '₹12–25 LPA', 55, 'Teach and lead a department at a dental college.', ['Teaching', 'Research', 'Leadership'], 'Few openings; needs an MDS.'),
    ]],
  ),
  gp: ladder(
    [
      L('Medical Officer / General Practitioner', '0–3 years', '₹6–14 LPA', 30, 'See patients with common illness and refer when needed.', ['Diagnosis', 'Talking to patients', 'Knowing when to refer'], 'Build a patient base or choose to specialise.'),
      L('Senior Medical Officer / Associate GP', '3–8 years', '₹10–20 LPA', 30, 'Handle a larger patient load, supervise juniors and manage long-term conditions.', ['Chronic care', 'Supervision', 'Local health needs'], 'Decide whether to specialise or build your own practice.'),
    ],
    ['spec', 'Specialise later', [
      L('Postgraduate trainee', 'About 3 years', 'Stipend of about ₹60k–1.2 L a month', 40, 'Return to study for an MD or MS through NEET-PG.', ['Exam preparation', 'Specialist skills'], 'Qualify through NEET-PG.'),
      L('Consultant / Specialist', 'After the PG degree', '₹18–45 LPA', 30, 'Practise as a specialist.', ['Judgement', 'Communication'], 'See the Doctor ladder for the full specialist path.'),
    ]],
    ['practice', 'Own practice', [
      L('Clinic owner', '5+ years', 'Varies widely, about ₹15–60 LPA', 60, 'Run a family clinic.', ['Patient trust', 'Business basics', 'Hiring'], 'Income depends on location and years of trust.'),
    ]],
  ),
};

// The ladder for a role: its own, else its parent's (a specialisation shares it).
export function ladderFor(roleId) {
  const own = LADDERS[roleId];
  if (own) return { ladder: own, inheritedFrom: null };
  const parentId = CAREER_MAP[roleId]?.parent;
  if (parentId && LADDERS[parentId]) return { ladder: LADDERS[parentId], inheritedFrom: parentId };
  return null;
}

export const hasLadder = (id) => Boolean(ladderFor(id));

// "Associate Product Manager → Product Manager → Senior Product Manager"
export function ladderChain(roleId, max = 3) {
  const found = ladderFor(roleId);
  if (!found) return '';
  const titles = found.ladder.tracks[0].levels.map((l) => l.title);
  return titles.slice(0, max).join(' → ') + (titles.length > max ? ' → …' : '');
}

// How many levels all tracks share before careers fork.
export function sharedLevels(ladder) {
  const [first, ...rest] = ladder.tracks;
  let n = 0;
  while (n < first.levels.length && rest.every((t) => t.levels[n]?.id === first.levels[n].id)) n++;
  return n;
}

// See replaceCareers: swap in database content without breaking existing imports.
export function replaceLadders(next) {
  for (const k of Object.keys(LADDERS)) delete LADDERS[k];
  Object.assign(LADDERS, next);
}
