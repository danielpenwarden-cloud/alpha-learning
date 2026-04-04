export const DOMAINS = [
  { id: 'literacy', name: 'Literacy & Language', icon: '\u{1F4D6}', color: '#f97316', sortOrder: 1 },
  { id: 'numeracy', name: 'Numeracy & Math', icon: '\u{1F522}', color: '#0ea5e9', sortOrder: 2 },
  { id: 'social', name: 'Social-Emotional', icon: '\u{1F49B}', color: '#eab308', sortOrder: 3 },
  { id: 'motor', name: 'Motor Skills', icon: '\u270B', color: '#22c55e', sortOrder: 4 },
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
