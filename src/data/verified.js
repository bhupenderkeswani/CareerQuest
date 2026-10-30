// Salary and entry-exam figures that were checked against a named public source (one-time review, REVIEWED_ON).
// Anything not listed here is an editorial estimate and says so (UNVERIFIED_SOURCE); it is not given a source it does not have.
//
// How the pay ranges were made: Payscale India publishes an average total pay for people with under a year of
// experience, with the number of salaries behind it. The range here is a judgement band around that average,
// not a published range. Samples are often small (n shown), so treat them as typical, not exact.
// Exam facts come from the official body where it could be opened (UCEED, NTA) and are marked when only a
// news or coaching page was available.

export const REVIEWED_ON = '2026-10-30';
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
};
