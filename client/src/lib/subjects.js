export const GROUP_1 = ['Advanced Accounting', 'Corporate & Other Laws', 'Direct Taxation', 'Indirect Taxation'];
export const GROUP_2 = ['Cost & Management Accounting', 'Auditing & Ethics', 'Financial Management', 'Strategic Management'];
export const ALL_SUBJECTS = [...GROUP_1, ...GROUP_2];

// ICAI CA Intermediate paper numbers, used in place of module numbers on the storefront.
export const PAPERS = {
  'Advanced Accounting': '01',
  'Corporate & Other Laws': '02',
  'Direct Taxation': '3A',
  'Indirect Taxation': '3B',
  'Cost & Management Accounting': '04',
  'Auditing & Ethics': '05',
  'Financial Management': '6A',
  'Strategic Management': '6B',
};

export function paperLabel(subjects = []) {
  const papers = subjects.map((s) => PAPERS[s]).filter(Boolean);
  if (!papers.length) return '';
  return papers.length === 1 ? `Paper ${papers[0]}` : `Papers ${papers.join(', ')}`;
}

export const PRICING = [
  ['Subject wise', '₹1,000'],
  ['Group wise', '₹3,000'],
  ['Both Groups', '₹6,000'],
];
