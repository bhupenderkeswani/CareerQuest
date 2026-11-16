// Salary and entry-exam figures that were checked against a named public source (one-time review, REVIEWED_ON).
// Anything not listed here is an editorial estimate and says so (UNVERIFIED_SOURCE); it is not given a source it does not have.
//
// How the pay ranges were made: Payscale India publishes an average total pay for people with under a year of
// experience, with the number of salaries behind it. The range here is a judgement band around that average,
// not a published range. Samples are often small (n shown), so treat them as typical, not exact.
// Exam facts come from the official body where it could be opened (UCEED, NTA) and are marked when only a
// news or coaching page was available.

export const REVIEWED_ON = '2026-10-30'; // first review: the original 40 roles
export const REVIEWED_THROUGH = '2026-11-16'; // latest review: six roles added after the student interviews
export const UNVERIFIED_SOURCE = 'Editorial estimate (not yet checked against a published source)';

const PS = (title, avg, n) => `Payscale India, ${title}: entry-level average ${avg} (${n} salaries), checked Oct 2026`;
const JEE = 'NTA, JEE Main (nta.ac.in), checked Oct 2026. BCA admission varies by college.';
const JEE_VALUE = 'JEE Main and Advanced for top B.Tech; BCA colleges set their own route (often CUET-UG)';
const UCEED = 'IIT Bombay, UCEED 2027 (uceed.iitb.ac.in), checked Oct 2026';
const NEETPG = 'NBEMS NEET-PG 2026 pattern, via Careers360, checked Oct 2026. Official site not opened.';
const NEETUG = 'NEET-UG 2026 rules, via PW Live, checked Oct 2026. Official NTA/NMC pages not opened.';

export const VERIFIED = {
  // Tech
  'data-analyst': { salary: ['₹3.5–7 LPA', PS('Data Analyst', '₹4.1 L', 576)] },
  'software-dev': { salary: ['₹3.5–8 LPA', PS('Software Developer', '₹4.8 L', 353)], exam: ['JEE Main and Advanced for top engineering colleges; BCA colleges set their own route (often CUET-UG)', JEE] },
  'ux-designer': { salary: ['₹3.5–8 LPA', PS('UX Designer', '₹4.0 L', 168)], exam: ['Optional design entrance (UCEED; NID DAT; many design schools run their own)', UCEED] },
  'cyber-analyst': { salary: ['₹3.5–7 LPA', PS('Cyber Security Analyst', '₹4.7 L', 82)] },
  'data-scientist': { salary: ['₹5–10 LPA', PS('Data Scientist', '₹6.0 L', 307)] },
  'devops-engineer': { salary: ['₹4–9 LPA', PS('DevOps Engineer', '₹4.5 L', 80)] },
  'qa-engineer': { salary: ['₹3–6 LPA', PS('QA Engineer', '₹2.9 L', 100)] },
  'frontend-dev': { salary: ['₹3–7 LPA', PS('Front End Developer', '₹3.6 L', 170)], exam: [JEE_VALUE, JEE] },
  'backend-dev': { salary: ['₹4–8 LPA', 'Payscale India, Back End Developer: entry-level average ₹4.6 L (only 8 salaries; Software Developer ₹4.8 L used as a cross-check), checked Oct 2026'], exam: [JEE_VALUE, JEE] },
  'mobile-dev': { salary: ['₹3–7 LPA', PS('Mobile Applications Developer', '₹2.9 L', 25)], exam: [JEE_VALUE, JEE] },
  'game-dev': { salary: ['₹3–6 LPA', 'Payscale India, Video Game Programmer: entry-level average ₹3.3 L (only 10 salaries), checked Oct 2026'] },
  'ui-designer': { salary: ['₹3–6 LPA', PS('User Interface Designer', '₹3.0 L', 43)], exam: ['Optional design entrance (UCEED; NID DAT; many design schools run their own)', UCEED] },
  'ux-researcher': { salary: ['₹4–9 LPA', 'Payscale India, UX Researcher: entry-level average ₹5.4 L (only 14 salaries, data from May 2025), checked Oct 2026'] },
  'data-engineer': { salary: ['₹4.5–9 LPA', PS('Data Engineer', '₹5.2 L', 125)], exam: [JEE_VALUE, JEE] },
  'ml-engineer': { salary: ['₹5–12 LPA', PS('Machine Learning Engineer', '₹6.0 L', 39)] },
  'pen-tester': { salary: ['₹4–8 LPA', PS('Penetration Tester', '₹5.0 L', 60)] },
  'soc-analyst': { salary: ['₹3–6 LPA', 'Payscale India, Security Analyst ₹3.6 L (55 salaries) and Information Security Analyst ₹3.5 L (31); no SOC-specific page exists, checked Oct 2026'] },

  // Health
  doctor: { salary: ['₹5–9 LPA (junior doctor)', PS('Medical Officer', '₹5.8 L', 69)], exam: ['NEET-UG', NEETUG] },
  nurse: { salary: ['₹2–4 LPA', PS('Staff Nurse', '₹2.3 L', 278)], exam: ['Varies by state: state entrance test or merit list; NEET is not compulsory for B.Sc Nursing', 'BoostMyTalent admission guide (secondary source), checked Oct 2026. INC and state sites not opened.'] },
  physio: { salary: ['₹2.5–4.5 LPA', PS('Physiotherapist', '₹2.9 L', 165)], exam: ['BPT: Class 12 with PCB, by merit or state or university test. NEET-UG becomes compulsory from 2027–28', 'Medical Dialogues, report on NCAHP deferral, checked Oct 2026'] },
  pharmacist: { salary: ['₹2.5–4 LPA', PS('Pharmacist', '₹2.5 L', 371)], exam: ['B.Pharm: state entrance tests (for example MHT-CET, KCET) or merit; NEET is not required', 'CollegeDekho B.Pharm entrance guide (secondary source), checked Oct 2026'] },
  gp: { salary: ['₹6–14 LPA (government and private clinics differ)', 'Payscale India, General Practitioner: average base ₹9.8 L (21 profiles); entry-level samples are very low and other sites disagree widely, checked Oct 2026'], exam: ['NEET-UG. No PG exam needed to practise', NEETUG] },
  surgeon: { salary: ['₹10–25 LPA (after specialisation)', 'Payscale India, Surgeon: early-career average ₹10.3 L, all-career ₹16 L (33 profiles, 2023), checked Oct 2026'], exam: ['NEET-UG, then NEET-PG for the specialisation', NEETPG] },
  paediatrician: { salary: ['₹8–20 LPA (after specialisation)', 'Payscale India, Paediatrician: entry-level ₹10.2 L, average ₹12.1 L (28 profiles); Shiksha quotes ₹6–15 L, checked Oct 2026'], exam: ['NEET-UG, then NEET-PG for the specialisation', NEETPG] },
  cardiologist: { salary: ['₹18–40 LPA (after super-specialisation)', 'Payscale India, Cardiologist: entry-level average ₹19.5 L (26 salaries, Sep 2024), checked Oct 2026'], exam: ['NEET-UG, NEET-PG, then NEET-SS for the DM', 'NBEMS NEET-SS 2026, via Daily Jagran, checked Oct 2026. Exam dates differ between sources.'] },
  dermatologist: { salary: ['₹10–25 LPA (after specialisation)', 'Payscale India, Dermatologist: entry-level ₹10.1 L, average ₹12.2 L (Mar 2026), checked Oct 2026'], exam: ['NEET-UG, then NEET-PG for the specialisation', NEETPG] },
  psychiatrist: { salary: ['₹9–20 LPA (after specialisation)', 'Payscale India, Psychiatrist: entry-level ₹9.3 L, 90th percentile about ₹20 L (96 profiles, Feb 2023), checked Oct 2026'], exam: ['NEET-UG, then NEET-PG for the specialisation', NEETPG] },
  radiologist: { salary: ['₹15–35 LPA (after specialisation)', 'Payscale India, Radiologist: entry-level ₹22 L (5 salaries), 1–4 years ₹20.6 L (21), average ₹29.6 L (2023), checked Oct 2026'], exam: ['NEET-UG, then NEET-PG for the specialisation', NEETPG] },
  dentist: { salary: ['₹2.5–6 LPA (new dentist; private practice income varies widely)', PS('Dentist', '₹3.0 L', 103)], exam: ['NEET-UG (for BDS)', 'NEET-UG 2026 rules for BDS, via PW Live, checked Oct 2026. DCI pages not opened.'] },

  // Business
  ca: { salary: ['₹8–14 LPA (newly qualified)', 'ICAI placement average about ₹13 L (via Careers360) and Big 4 freshers ₹8.5–12 L (Unstop blog), checked Oct 2026'], exam: ['CA Foundation, or direct entry to Intermediate for graduates (55% in commerce, 60% in other streams)', 'ICAI, new scheme FAQ (Sep 2024), checked Oct 2026'] },
  'digital-marketer': { salary: ['₹2.5–5 LPA', 'Payscale India, Digital Marketing Manager: entry-level average ₹3.1 L, 1–4 years ₹4.8 L, checked Oct 2026'] },
  'financial-analyst': { salary: ['₹3.5–7 LPA', 'Payscale India, Financial Analyst: entry-level average ₹3.9 L, average base ₹5.7 L, checked Oct 2026'] },
  'hr-manager': { salary: ['₹3.5–7 LPA (HR executive; a manager earns more later)', 'Payscale India, HR Manager: entry-level average ₹3.9 L, 1–4 years ₹5.2 L, all-career ₹8.6 L, checked Oct 2026'], exam: ['MBA entrance (for example CAT, XAT) for top colleges', 'CAT 2026 (IIM Indore), via Careers360, checked Oct 2026. XAT not checked.'] },
  'product-manager': { salary: ['₹10–25 LPA (usually after 2–4 years in another role)', 'Payscale India, Product Manager (Software): 1–4 years ₹15.5 L; Associate Product Manager ₹10 L, checked Oct 2026. Other sites quote higher.'], exam: ['None; MBA entrance (for example CAT) if you take the MBA route', 'CAT 2026 (IIM Indore), via Careers360, checked Oct 2026'] },
  'business-analyst': { salary: ['₹4–9 LPA', 'Payscale India, Business Analyst (IT): entry-level average ₹4.6 L, 1–4 years ₹6.2 L, checked Oct 2026'], exam: ['None; MBA entrance if you take the MBA route', 'CAT 2026 (IIM Indore), via Careers360, checked Oct 2026'] },
  auditor: { salary: ['₹6–10 LPA (newly qualified CA)', 'Big 4 audit for newly qualified CAs ₹8.5–10 L (Unstop blog); Payscale India, Auditor (all auditors): ₹4.9 L entry, checked Oct 2026'], exam: ['CA Foundation (CA route)', 'ICAI, new scheme FAQ (Sep 2024), checked Oct 2026'] },
  'tax-consultant': { salary: ['₹5–10 LPA', 'Payscale India, Tax Consultant: entry-level average ₹5.4 L, 1–4 years ₹7.8 L, checked Oct 2026'], exam: ['CA Foundation (CA route)', 'ICAI, new scheme FAQ (Sep 2024), checked Oct 2026'] },
  'seo-specialist': { salary: ['₹2–4.5 LPA', 'Payscale India, SEO Specialist: entry-level average ₹2.0 L, average base ₹3.5 L, checked Oct 2026'] },
  'social-media-manager': { salary: ['₹2.5–5 LPA', 'Payscale India, Social Media Manager: entry-level average ₹2.4 L, 1–4 years ₹3.5 L, checked Oct 2026'] },
  'graphic-designer': { salary: ['₹2.5–6 LPA', 'Payscale India, Graphic Designer: entry-level average ₹2.4 L, 1–4 years ₹3.5 L, checked Oct 2026'], exam: ['Optional design entrance (for example NID DAT, NIFT)', 'NID DAT 2027 via Careers360, checked Oct 2026. NIFT dates not verified.'] },
  // Added after the student interviews (Nov 2026). Only what a source supports; the rest stays an editorial estimate.
  'company-secretary': {
    salary: ['₹3–5 LPA (newly qualified)', 'Payscale India, Corporate Secretary: entry-level base ₹4.3 L (71 salaries, data from 2023); Taxscan quotes ₹3–5 L starting. No ICSI placement report found. Checked Nov 2026'],
    exam: ['CSEET after Class 12; graduates skip it and start at CS Executive', 'ICSI Council decisions of 17–18 Mar 2026, via TaxGuru. icsi.edu was not reachable. Checked Nov 2026'],
    cost: ['About ₹50k in ICSI fees, plus coaching', 'ICSI fees quoted on 2026–27 pages (about ₹50.5–54.5k); older pages say less. Not checked on icsi.edu. Checked Nov 2026'],
    demand: ['Growing', 'ICSI president, Aug 2026, via The News Trust: about 80,600 members, and a need for over 1 lakh CS. This is ICSI’s own projection. Checked Nov 2026'],
  },
  lawyer: {
    salary: ['₹1–8 LPA for most new graduates', 'Bar & Bench (2023): Chennai junior advocates ₹15–20k a month, some unpaid. Payscale India, Corporate Lawyer: entry-level ₹5.9 L (43 salaries, Mar 2026). Top law-school placements are far higher (aggregator-reported). Checked Nov 2026'],
    exam: ['CLAT or similar for the 5-year LLB after Class 12; the Bar exam to practise', 'All India Bar Examination site (opened) for the Bar exam. CLAT details are from secondary pages, not checked on the Consortium of NLUs site. Checked Nov 2026'],
    study: ['5 years after Class 12, or 3 years after a degree', 'All India Bar Examination eligibility: 3-year or 5-year LLB. Checked Nov 2026'],
    cost: ['Up to ₹22 L at top law schools; lower elsewhere', 'NLSIU fee structure 2026–27 (Toprankers, Nov 2026): about ₹4.5 L a year including hostel. Other colleges not researched'],
  },
  accountant: {
    salary: ['₹2–3.5 LPA', 'Payscale India, Accountant: entry-level average ₹2.3 L (247 salaries, updated Oct 2026). Checked Nov 2026'],
  },
  dietitian: {
    salary: ['₹2–3.5 LPA', 'Payscale India, Dietitian: entry-level ₹2.0 L (40 salaries, Apr 2026); Nutritionist: ₹2.6 L (23, Mar 2025). Checked Nov 2026'],
    exam: ['No national entrance exam. A Registered Dietitian needs a postgraduate qualification and an internship', 'Indian Dietetic Association, RD eligibility (idaindia.com, opened). B.Sc admission details are from secondary pages. Checked Nov 2026'],
    study: ['B.Sc in Food and Nutrition (3 to 4 years); about 6 years to Registered Dietitian', 'Indian Dietetic Association, RD eligibility (opened) for the postgraduate and internship steps. The B.Sc length is from secondary pages. Checked Nov 2026'],
  },
  'fitness-trainer': {
    salary: ['₹1.5–3.5 LPA', 'Payscale India, Personal Trainer: entry-level average ₹3.0 L (35 salaries, Feb 2026). Gym fresher pay quoted lower by fitness institutes, not checked. Checked Nov 2026'],
    exam: ['None. A recognised fitness certificate is the usual route', 'National Qualification Register: General Fitness Trainer, NSQF Level 4 (nqr.gov.in, opened); REPS India register. Checked Nov 2026'],
    study: ['A certificate course of about 450 hours; a B.P.Ed degree is optional', 'National Qualification Register: 450 notional hours (opened). B.P.Ed length is from secondary pages. Checked Nov 2026'],
    cost: ['About ₹8k a year to register, plus course fees', 'REPS India registration ₹7,918 a year (repsindia.org, opened). Course fees not sourced. Checked Nov 2026'],
    demand: ['Growing', 'Deloitte and Health & Fitness Association India fitness report 2025: market growing about 15% a year to about ₹37,700 crore by 2030 (opened). Checked Nov 2026'],
  },
  'sports-coach': {
    salary: ['About ₹500–1,000 a session at the start; income depends on how many students you have', 'UrbanPro chess fees (₹300–500 an hour) and The Tribune, Jul 2024 (₹500–1,000 an hour for basics). Marketplace and press figures, low reliability; not a salary survey. Checked Nov 2026'],
    exam: ['None to start. FIDE coach titles and the NIS diploma are optional', 'FIDE Trainers’ Commission (trainers.fide.com, opened): titles by a 16-hour seminar. NSNIS Patiala sports-coaching diploma (opened). Checked Nov 2026'],
    study: ['No degree needed for chess; the NIS sports-coaching diploma is 1 year', 'NSNIS Patiala diploma in sports coaching (nsnis.org, opened). Checked Nov 2026'],
    cost: ['A FIDE seminar costs up to about €350; the NIS diploma ₹63,800', 'FIDE seminar fees (trainers.fide.com) and NSNIS fee ₹63,800 (nsnis.org), both opened. Euro figure is not converted. Checked Nov 2026'],
  },
};

// Second pass (16 Nov 2026): study, cost and demand for the ten most-viewed top-level roles. Only claims backed by a
// page that was opened are listed; search-only figures stay editorial estimates. Several fee figures come from
// education aggregator sites, and the source says so.
const SECOND_PASS = {
  doctor: {
    cost: ['Government ₹0.1–5 L in total; private ₹7 L to over ₹1 Cr', 'FindMyCollege MBBS fee survey (aggregator): government ₹1,364 to ₹5 L, private ₹7 L to ₹1.35 Cr, median about ₹36 L. Checked Nov 2026'],
    demand: ['Steady', 'Health Ministry reply in Rajya Sabha, Dec 2025 (via Medical Dialogues): 1 doctor per 811 people. MBBS seats have also grown sharply, so competition for jobs grows too. Checked Nov 2026'],
  },
  'software-dev': {
    demand: ['Steady', 'Naukri JobSpeak, Oct 2026 (via Storyboard18): software and QA hiring up only 1% a year, while AI and ML roles grew 32%. Checked Nov 2026'],
  },
  ca: {
    study: ['About 4.5–5 years including articleship', 'ICAI (ccg.icai.org): 2-year articleship; total length from secondary pages. Checked Nov 2026'],
  },
  'data-analyst': {
    demand: ['Growing', 'India Skills Report 2026 (ETS, CII, AICTE; via Careers360): data analytics among the most in-demand skills. Checked Nov 2026'],
  },
  'financial-analyst': {
    cost: ['₹1–30 L in total (a degree, plus an MBA if you take one)', 'IIM Ahmedabad PGP fee ₹27.5 L for 2025–27 (via Cracku, aggregator); degree fees from secondary pages. Checked Nov 2026'],
    demand: ['Steady', 'Naukri JobSpeak, Oct 2026: banking and financial services hiring up 16% a year (one month, against a weak base). Checked Nov 2026'],
  },
  'digital-marketer': {
    demand: ['Growing', 'TeamLease EdTech, via Open magazine: fresher hiring intent in marketing rose to 62% in the first half of 2026, from 11% a year earlier. Checked Nov 2026'],
  },
  'ux-designer': {
    cost: ['Any degree plus a course ₹50k–5 L; a B.Des at NID about ₹19 L', 'NID Ahmedabad B.Des about ₹19.2 L for 4 years including hostel (via Toprankers, aggregator); course costs from secondary pages. Checked Nov 2026'],
  },
  nurse: {
    study: ['B.Sc Nursing (4 years) or GNM diploma (3 years)', 'Indian Nursing Council, nursing programmes page. Checked Nov 2026'],
    cost: ['Government ₹10k–1.5 L in total; private ₹2–12 L', 'Propelld B.Sc Nursing fee guide: government ₹7,000 to ₹1.5 L, private ₹50k–3 L a year. Checked Nov 2026'],
    demand: ['Growing', 'Health Ministry reply in Rajya Sabha, Jul 2026 (via The South First): 2.6 nurses per 1,000 people, below the WHO benchmark of 3. Checked Nov 2026'],
  },
  'hr-manager': {
    cost: ['₹2–35 L in total, mostly the HR MBA', 'TISS MA HRM about ₹2 L (via Cracku) and XLRI HRM about ₹30.6 L for 2025–27 (via Catmock), both aggregators. Checked Nov 2026'],
  },
  'product-manager': {
    cost: ['₹1–10 L for the degree; ₹25–40 L with a top MBA', 'IIM Ahmedabad PGP fee ₹27.5 L (via Cracku, aggregator); degree fees from secondary pages. Checked Nov 2026'],
  },
};
for (const [id, fields] of Object.entries(SECOND_PASS)) Object.assign((VERIFIED[id] ||= {}), fields);
