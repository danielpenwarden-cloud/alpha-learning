import { useState, useEffect } from 'react';
import { useStudent, calcAge } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import ChildForm from '../shared/ChildForm';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../lib/notifications';

export default function SettingsPage() {
  const { student, students, isOnline, addStudent, removeStudent, updateStudentDetails } = useStudent();
  const { user, isDemo } = useAuth();
  const [notifPermission, setNotifPermission] = useState('default');
  const [prefs, setPrefs] = useState({
    sundayRecap: true,
    milestoneAlerts: true,
    plateauWarnings: true,
    assessmentReminders: true,
  });
  const [editingChildId, setEditingChildId] = useState(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  useEffect(() => {
    if (isNotificationSupported()) {
      setNotifPermission(getNotificationPermission());
    }
    const saved = localStorage.getItem('alpha-notification-prefs');
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch {}
    }
  }, []);

  function updatePref(key, value) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem('alpha-notification-prefs', JSON.stringify(updated));
  }

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  }

  function handleEditChild(childId, data) {
    updateStudentDetails(childId, data);
    setEditingChildId(null);
  }

  function handleAddChild(data) {
    addStudent({
      firstName: data.firstName,
      dateOfBirth: data.dateOfBirth,
      schoolName: data.schoolName || '',
      notes: '',
      targetSchoolEntry: '',
      country: data.country || 'US',
    });
    setShowAddChild(false);
  }

  function handleConfirmRemove() {
    if (confirmRemoveId) {
      removeStudent(confirmRemoveId);
      setConfirmRemoveId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl md:text-3xl">
          Settings
        </h2>
        <p className="text-text-secondary text-sm md:text-base mt-1 mb-4">
          Manage notifications, data, and preferences.
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-3">Connection Status</h3>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
          <div>
            <p className="text-text-primary text-sm">
              {isOnline ? 'Connected to Supabase' : 'Offline Mode (Local Data)'}
            </p>
            <p className="text-text-dim text-xs mt-0.5">
              {isOnline
                ? 'All changes are saved to the cloud in real-time.'
                : 'Data is stored locally. Connect Supabase to sync across devices.'}
            </p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-3">Account</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Email</span>
            <span className="text-text-primary">{user?.email || 'demo@alpha.local'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Display Name</span>
            <span className="text-text-primary">{user?.user_metadata?.display_name || 'Parent'}</span>
          </div>
        </div>
      </div>

      {/* Children Management */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary text-sm md:text-base font-semibold">Children</h3>
          {!isDemo && !showAddChild && (
            <button
              onClick={() => setShowAddChild(true)}
              className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
            >
              Add Child
            </button>
          )}
        </div>

        <div className="space-y-3">
          {students.map(child => {
            const childAge = calcAge(child.dateOfBirth);
            const isEditing = editingChildId === child.id;

            if (isEditing) {
              return (
                <div key={child.id} className="bg-bg-hover rounded-xl p-4 border border-border-light">
                  <p className="text-text-primary text-xs font-semibold mb-3">Edit {child.firstName}</p>
                  <ChildForm
                    initial={child}
                    onSubmit={(data) => handleEditChild(child.id, data)}
                    onCancel={() => setEditingChildId(null)}
                    submitLabel="Save Changes"
                  />
                </div>
              );
            }

            return (
              <div key={child.id} className="flex items-center justify-between bg-bg-hover rounded-lg px-4 py-3 border border-border-light">
                <div>
                  <p className="text-text-primary text-sm font-medium">{child.firstName}</p>
                  <p className="text-text-dim text-xs">
                    {childAge.years}yr {childAge.months}mo
                    {child.schoolName ? ` \u00B7 ${child.schoolName}` : ''}
                    {child.country ? ` \u00B7 ${child.country}` : ''}
                  </p>
                </div>
                {!isDemo && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingChildId(child.id)}
                      className="text-xs px-2 py-1 rounded border border-border text-text-muted hover:text-text-primary hover:border-text-dim transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmRemoveId(child.id)}
                      disabled={students.length <= 1}
                      className="text-xs px-2 py-1 rounded border border-border text-text-muted hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add child form */}
        {showAddChild && (
          <div className="mt-3 bg-bg-hover rounded-xl p-4 border border-border-light">
            <p className="text-text-primary text-xs font-semibold mb-3">Add a new child</p>
            <ChildForm
              onSubmit={handleAddChild}
              onCancel={() => setShowAddChild(false)}
              submitLabel="Add Child"
            />
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-3">Notifications</h3>

        {/* Permission status */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-light">
          <div>
            <p className="text-text-primary text-sm">Push Notifications</p>
            <p className="text-text-dim text-xs mt-0.5">
              {notifPermission === 'granted' ? 'Enabled' : notifPermission === 'denied' ? 'Blocked in browser settings' : 'Not enabled'}
            </p>
          </div>
          {notifPermission === 'default' && (
            <button
              onClick={enableNotifications}
              className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
            >
              Enable
            </button>
          )}
          {notifPermission === 'granted' && (
            <span className="text-green-600 text-xs flex items-center gap-1">
              {'\u2705'} Active
            </span>
          )}
          {notifPermission === 'denied' && (
            <span className="text-red-600 text-xs">Blocked</span>
          )}
        </div>

        {/* Notification preferences */}
        <div className="space-y-3">
          <TogglePref
            label="Sunday Weekly Recap"
            description="Get a summary of the week's progress every Sunday at 9am"
            checked={prefs.sundayRecap}
            onChange={v => updatePref('sundayRecap', v)}
          />
          <TogglePref
            label="Milestone Completion Alerts"
            description="Notify when a milestone is marked as mastered"
            checked={prefs.milestoneAlerts}
            onChange={v => updatePref('milestoneAlerts', v)}
          />
          <TogglePref
            label="Plateau Warnings"
            description="Alert when a milestone hasn't progressed in 2+ weeks"
            checked={prefs.plateauWarnings}
            onChange={v => updatePref('plateauWarnings', v)}
          />
          <TogglePref
            label="Assessment Reminders"
            description="Weekly reminder to run a quick assessment"
            checked={prefs.assessmentReminders}
            onChange={v => updatePref('assessmentReminders', v)}
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-3">Data Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary text-sm">Export All Data</p>
              <p className="text-text-dim text-xs mt-0.5">Download milestone data as JSON</p>
            </div>
            <button
              onClick={() => exportData(student)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-text-dim transition-colors"
            >
              Export JSON
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary text-sm">Privacy</p>
              <p className="text-text-dim text-xs mt-0.5">PII auto-redaction is active on all AI processing</p>
            </div>
            <span className="text-green-600 text-xs flex items-center gap-1">
              {'\u{1F512}'} Protected
            </span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-3">About</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Version</span>
            <span className="text-text-primary">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Framework</span>
            <span className="text-text-primary">React 18 + Vite</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">AI Model</span>
            <span className="text-text-primary">Claude Sonnet 4</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Benchmarks</span>
            <span className="text-text-primary">US (primary), NZ, AU</span>
          </div>
        </div>
      </div>

      {/* Confirm Remove Dialog */}
      {confirmRemoveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmRemoveId(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-bg-card border border-red-200 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-text-primary text-sm font-semibold mb-2">Remove child?</h3>
            <p className="text-text-secondary text-xs mb-4">
              This will permanently remove <span className="text-text-primary font-medium">{students.find(s => s.id === confirmRemoveId)?.firstName}</span> and all their milestone data. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRemoveId(null)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-text-secondary bg-bg-hover border border-border hover:bg-bg-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TogglePref({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-primary text-sm">{label}</p>
        <p className="text-text-dim text-xs mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${
          checked ? 'bg-literacy' : 'bg-border'
        }`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'left-5.5 translate-x-0' : 'left-0.5'
        }`}
          style={checked ? { left: '22px' } : { left: '2px' }}
        />
      </button>
    </div>
  );
}

function exportData(student) {
  const data = {
    exportDate: new Date().toISOString(),
    student: {
      firstName: student.firstName,
      dateOfBirth: student.dateOfBirth,
      schoolName: student.schoolName,
    },
    milestones: JSON.parse(localStorage.getItem('alpha-milestones') || '{}'),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpha-learning-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
