import { useState } from 'react';

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'AU', label: 'Australia' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'TH', label: 'Thailand' },
  { value: 'OTHER', label: 'Other' },
];

export default function ChildForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [firstName, setFirstName] = useState(initial?.firstName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth || '');
  const [schoolName, setSchoolName] = useState(initial?.schoolName || '');
  const [country, setCountry] = useState(initial?.country || 'US');

  function handleSubmit(e) {
    e.preventDefault();
    if (!firstName.trim() || !dateOfBirth) return;
    onSubmit({ firstName: firstName.trim(), dateOfBirth, schoolName: schoolName.trim(), country });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-text-secondary text-xs mb-1">First name *</label>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
          placeholder="e.g. Emma"
          required
        />
        <p className="text-text-dim text-[10px] mt-1">We only use first names for privacy</p>
      </div>
      <div>
        <label className="block text-text-secondary text-xs mb-1">Date of birth *</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={e => setDateOfBirth(e.target.value)}
          className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-text-secondary text-xs mb-1">School name (optional)</label>
        <input
          type="text"
          value={schoolName}
          onChange={e => setSchoolName(e.target.value)}
          className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
          placeholder="e.g. Sunny Days Preschool"
        />
      </div>
      <div>
        <label className="block text-text-secondary text-xs mb-1">Country</label>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
        >
          {COUNTRY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!firstName.trim() || !dateOfBirth}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-30 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
