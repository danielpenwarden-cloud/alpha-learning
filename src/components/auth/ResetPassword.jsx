import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { updatePassword } from '../../lib/auth';

export default function ResetPassword() {
  const { clearRecovery } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      clearRecovery();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u2705'}
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl mb-2">Password Updated</h2>
          <p className="text-text-secondary text-sm mb-6">Your password has been changed successfully.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u03B1'}
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl">Set New Password</h2>
          <p className="text-text-secondary text-sm mt-1">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-xs mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
              placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
              required
              minLength={6}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
              placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-700 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
