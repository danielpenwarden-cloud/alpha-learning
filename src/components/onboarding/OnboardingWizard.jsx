import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStudent } from '../../hooks/useStudent';
import { updateProfile } from '../../lib/db';
import { signOut } from '../../lib/auth';
import ChildForm from '../shared/ChildForm';
import { calcAge } from '../../hooks/useStudent';

const SETUP_OPTIONS = [
  { id: 'assessment', icon: '\u2705', title: 'Quick Assessment', desc: '5-minute micro-assessment to set initial milestone levels' },
  { id: 'upload', icon: '\u{1F4C1}', title: 'Upload a Report', desc: 'Upload a school report and let AI extract milestone evidence' },
  { id: 'later', icon: '\u{1F552}', title: "I'll set up later", desc: 'Start with all milestones at 0% and update as you go' },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { addStudent } = useStudent();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [parentName, setParentName] = useState(user?.user_metadata?.display_name || '');
  const [children, setChildren] = useState([]);
  const [setupChoices, setSetupChoices] = useState({});
  const [showChildForm, setShowChildForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleStep1Next() {
    if (!parentName.trim()) return;
    // Save parent name to profile
    if (user && user.id !== 'offline' && user.id !== 'demo') {
      updateProfile(user.id, { displayName: parentName.trim() });
    }
    setStep(2);
  }

  function handleAddChild(data) {
    setChildren(prev => [...prev, { ...data, _key: Date.now() }]);
    setShowChildForm(false);
  }

  function handleRemoveChild(key) {
    setChildren(prev => prev.filter(c => c._key !== key));
    setSetupChoices(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSetupChoice(childKey, choiceId) {
    setSetupChoices(prev => ({ ...prev, [childKey]: choiceId }));
  }

  async function handleFinish() {
    if (children.length === 0) return;
    setSaving(true);
    setError('');

    try {
      for (const child of children) {
        await addStudent({
          firstName: child.firstName,
          dateOfBirth: child.dateOfBirth,
          schoolName: child.schoolName || '',
          notes: '',
          targetSchoolEntry: '',
          country: child.country || 'US',
        });
      }

      // Navigate based on first child's setup choice
      // After addStudent, hasStudents becomes true so AppContent will show the dashboard.
      // We navigate to set the right route within the dashboard.
      const firstChoice = setupChoices[children[0]._key] || 'later';
      if (firstChoice === 'assessment') {
        navigate('/assessment');
      } else if (firstChoice === 'upload') {
        navigate('/docs');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error during onboarding:', err);
      const msg = err?.message || err?.details || String(err);
      setError(`Failed to create student profile: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // Allow finishing step 3 if all children have a choice, OR let them skip
  const allChildrenHaveChoice = children.length > 0 && children.every(c => setupChoices[c._key]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8 max-w-lg w-full">
        {/* Logo + logout */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
              {'\u03B1'}
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-text-primary text-lg">Alpha Learning</h1>
              <p className="text-text-dim text-xs">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="text-text-dim text-xs hover:text-text-muted transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 rounded-full flex-1 transition-colors ${s <= step ? 'bg-literacy' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Step 1: Parent Name */}
        {step === 1 && (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl mb-1">
              Welcome! Let's set up your profile
            </h2>
            <p className="text-text-secondary text-sm mb-5">What should we call you?</p>
            <div className="mb-4">
              <label className="block text-text-secondary text-xs mb-1">Your first name</label>
              <input
                type="text"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
                placeholder="e.g. Dan"
                autoFocus
              />
            </div>
            <button
              onClick={handleStep1Next}
              disabled={!parentName.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-30 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Add Children */}
        {step === 2 && (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl mb-1">
              Add your child
            </h2>
            <p className="text-text-secondary text-sm mb-5">
              Tell us about your child so we can personalize their learning dashboard.
            </p>

            {/* Added children */}
            {children.length > 0 && (
              <div className="space-y-2 mb-4">
                {children.map(child => {
                  const childAge = calcAge(child.dateOfBirth);
                  return (
                    <div key={child._key} className="flex items-center justify-between bg-bg-hover rounded-lg px-3 py-2.5 border border-border-light">
                      <div>
                        <span className="text-text-primary text-sm font-medium">{child.firstName}</span>
                        <span className="text-text-dim text-xs ml-2">{childAge.years}yr {childAge.months}mo</span>
                      </div>
                      <button
                        onClick={() => handleRemoveChild(child._key)}
                        className="text-text-dim hover:text-red-600 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Child form */}
            {showChildForm ? (
              <ChildForm
                onSubmit={handleAddChild}
                onCancel={children.length > 0 ? () => setShowChildForm(false) : undefined}
                submitLabel="Add Child"
              />
            ) : (
              <button
                onClick={() => setShowChildForm(true)}
                className="w-full py-2 rounded-lg text-sm text-text-muted border border-dashed border-border hover:border-text-dim hover:text-text-secondary transition-colors mb-4"
              >
                + Add another child
              </button>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-lg text-sm text-text-secondary border border-border hover:bg-bg-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={children.length === 0}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-30 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Setup Choice */}
        {step === 3 && (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl mb-1">
              How would you like to start?
            </h2>
            <p className="text-text-secondary text-sm mb-5">
              Choose how to set initial milestone data{children.length > 1 ? ' for each child' : ''}.
            </p>

            {children.map(child => (
              <div key={child._key} className="mb-4">
                {children.length > 1 && (
                  <p className="text-text-primary text-sm font-semibold mb-2">{child.firstName}</p>
                )}
                <div className="space-y-2">
                  {SETUP_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleSetupChoice(child._key, opt.id)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        setupChoices[child._key] === opt.id
                          ? 'border-literacy bg-literacy/10'
                          : 'border-border hover:border-text-dim'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{opt.title}</p>
                        <p className="text-text-dim text-xs mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <p className="text-red-700 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-lg text-sm text-text-secondary border border-border hover:bg-bg-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving || !allChildrenHaveChoice}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-30 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
              >
                {saving ? 'Setting up...' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
