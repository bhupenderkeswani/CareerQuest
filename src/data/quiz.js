// Interest quiz (US14). 9 questions, ~3 minutes. No caste, religion, gender or family income.
// `quizMeta.version` is stored with each student's answers so old answers stay interpretable.
export const quizMeta = { version: 1 };

export const QUESTIONS = [
  {
    id: 'subjects', type: 'multi',
    title: 'Which school subjects do you enjoy?', help: 'Pick as many as you like.',
    options: [
      { v: 'maths', label: 'Maths' },
      { v: 'science', label: 'Science (Physics, Chemistry, Biology)' },
      { v: 'computers', label: 'Computers' },
      { v: 'commerce', label: 'Accounts and Economics' },
      { v: 'languages', label: 'Languages and writing' },
      { v: 'social', label: 'Social Science' },
    ],
  },
  {
    id: 'style', type: 'multi', max: 2,
    title: 'How do you like to work?', help: 'Pick up to 2.',
    options: [
      { v: 'people', label: 'With people' },
      { v: 'data', label: 'With numbers and data' },
      { v: 'hands', label: 'Hands-on and practical' },
      { v: 'creative', label: 'Creating and designing' },
    ],
  },
  {
    id: 'interests', type: 'multi',
    title: 'What are you curious about?', help: 'Pick as many as you like.',
    options: [
      { v: 'tech', label: 'Technology' },
      { v: 'helping', label: 'Helping people' },
      { v: 'business', label: 'Money and business' },
      { v: 'design', label: 'Design and media' },
      { v: 'puzzles', label: 'Solving puzzles' },
      { v: 'health', label: 'Health and the body' },
    ],
  },
  {
    id: 'exams', type: 'single',
    title: 'How do you feel about entrance exams?',
    options: [
      { v: 2, label: 'Happy to prepare hard for one' },
      { v: 1, label: 'Fine if I need to' },
      { v: 0, label: 'I would rather avoid them' },
    ],
  },
  {
    id: 'years', type: 'single',
    title: 'How do you feel about studying for many years?',
    options: [
      { v: 2, label: 'Happy to study long (6+ years)' },
      { v: 1, label: 'A few years is fine (3–5)' },
      { v: 0, label: 'Want to start earning early (3 or fewer)' },
    ],
  },
  {
    id: 'budget', type: 'single',
    title: 'What study cost would you be comfortable with, in total?',
    help: 'We ask about what feels comfortable, not about your family’s income.',
    options: [
      { v: 0, label: 'Low (under ₹2 lakh)' },
      { v: 1, label: 'Medium (₹2 to 10 lakh)' },
      { v: 2, label: 'Higher is okay (with loans or scholarships)' },
    ],
  },
  {
    id: 'reloc', type: 'single',
    title: 'Would you move to another city to study or work?',
    options: [
      { v: 2, label: 'Yes, happily' },
      { v: 1, label: 'Maybe' },
      { v: 0, label: 'I would rather stay near home' },
    ],
  },
  {
    id: 'city', type: 'single', optional: true,
    title: 'Which kind of city would you like to work in?', help: 'Optional. You can skip this.',
    options: [
      { v: 'metro', label: 'A big metro' },
      { v: 'tier2', label: 'A smaller city' },
      { v: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'avoid', type: 'multi', optional: true,
    title: 'Is there anything you are sure you do not want?', help: 'Optional. We will steer away from these.',
    options: [
      { v: 'longStudy', label: 'Very long study' },
      { v: 'exams', label: 'Heavy entrance exams' },
      { v: 'relocation', label: 'Moving far from home' },
      { v: 'desk', label: 'Desk-based work' },
      { v: 'clinical', label: 'Working with patients or blood' },
      { v: 'maths', label: 'Heavy maths' },
    ],
  },
];

// See replaceCareers: swap in database content without breaking existing imports.
export function replaceQuestions(list, version) {
  QUESTIONS.length = 0; QUESTIONS.push(...list);
  if (version != null) quizMeta.version = version;
}
