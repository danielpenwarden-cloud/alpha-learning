// PII Detection and Redaction
// Strips personally identifiable information before sending text to AI processing.

const PII_PATTERNS = [
  { type: 'email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
  { type: 'phone', pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, replacement: '[PHONE]' },
  { type: 'nz_ird', pattern: /\b\d{2}-?\d{3}-?\d{3}\b/g, replacement: '[IRD]' },
  { type: 'address', pattern: /\d{1,5}\s[\w\s]{3,30}(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|crescent|cres|terrace|tce|place|pl|way)\b/gi, replacement: '[ADDRESS]' },
  { type: 'dob', pattern: /\b(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.](?:19|20)\d{2}\b/g, replacement: '[DOB]' },
  { type: 'dob_iso', pattern: /\b(?:19|20)\d{2}[-/](?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])\b/g, replacement: '[DOB]' },
  { type: 'nhi', pattern: /\b[A-Z]{3}\d{4}\b/g, replacement: '[NHI]' },
];

// Names to redact — populated per-student
let protectedNames = [];

export function setProtectedNames(names) {
  protectedNames = names.filter(Boolean).map(n => n.trim()).filter(n => n.length > 1);
}

export function detectPII(text) {
  const findings = [];

  // Check regex patterns
  for (const { type, pattern } of PII_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      findings.push({
        type,
        value: match[0],
        index: match.index,
        length: match[0].length,
      });
    }
  }

  // Check protected names
  for (const name of protectedNames) {
    const nameRegex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi');
    let match;
    while ((match = nameRegex.exec(text)) !== null) {
      findings.push({
        type: 'name',
        value: match[0],
        index: match.index,
        length: match[0].length,
      });
    }
  }

  return findings;
}

export function redactPII(text) {
  let redacted = text;
  const log = [];

  // Apply regex patterns
  for (const { type, pattern, replacement } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => log.push({ type, original: m, replacement }));
      redacted = redacted.replace(pattern, replacement);
    }
  }

  // Redact protected names
  for (const name of protectedNames) {
    const nameRegex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi');
    const matches = redacted.match(nameRegex);
    if (matches) {
      matches.forEach(m => log.push({ type: 'name', original: m, replacement: '[NAME]' }));
      redacted = redacted.replace(nameRegex, '[NAME]');
    }
  }

  return { redacted, log, hadPII: log.length > 0 };
}

export function redactForAI(text, studentName) {
  // Temporarily add student name to protected list
  const prevNames = [...protectedNames];
  if (studentName && !protectedNames.includes(studentName)) {
    protectedNames = [...protectedNames, studentName];
  }
  const result = redactPII(text);
  protectedNames = prevNames;
  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
