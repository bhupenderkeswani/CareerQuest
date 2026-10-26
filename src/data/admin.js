// Seeded items for the internal review queue (S24): changes from the daily refresh job that
// crossed the approval threshold (salary shift of 10%+, or any exam/eligibility change).
export const SEED_QUEUE = [
  {
    id: 'q-da-salary', kind: 'change', roleId: 'data-analyst', field: 'salary',
    old: '₹4–9 LPA', next: '₹4.5–10 LPA', source: 'Salary survey (sample)',
    note: 'Upper end moved +11%, above the 10% threshold.',
  },
  {
    id: 'q-ca-exam', kind: 'change', roleId: 'ca', field: 'exam',
    old: 'CA Foundation', next: 'CA Foundation (new registration window)', source: 'Official exam notice (sample)',
    note: 'Exam or eligibility changes are always reviewed.',
  },
  {
    id: 'q-sd-demand', kind: 'change', roleId: 'software-dev', field: 'demand',
    old: 'Steady', next: 'Growing', source: 'Hiring trends report (sample)',
    note: 'Source changed its labels. Check before publishing.',
  },
];
