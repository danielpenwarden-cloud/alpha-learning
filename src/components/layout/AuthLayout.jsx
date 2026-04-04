import { useState } from 'react';
import { signIn, signUp, resetPassword } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const FEATURES = [
  { icon: '\u{1F4CA}', title: 'Triple Benchmarks', desc: 'Track against US, NZ, and AU standards' },
  { icon: '\u{1F9E0}', title: 'AI-Powered Insights', desc: 'Personalized learning recommendations' },
  { icon: '\u{1F4C8}', title: '40 Milestones', desc: 'Across literacy, numeracy, social, and motor domains' },
  { icon: '\u{1F4F1}', title: 'Works Offline', desc: 'PWA — install on any device' },
];

export default function AuthLayout() {
  const { loginAsDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // If Supabase isn't configured, show an info screen
  if (!supabase) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u03B1'}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-text-primary text-2xl mb-2">Alpha Learning</h1>
          <p className="text-text-secondary text-sm mb-6">Supabase is not configured yet. Add your credentials to <code className="text-literacy">.env.local</code> and restart.</p>
          <div className="bg-bg-hover rounded-lg p-4 text-left text-xs text-text-muted font-mono">
            <p>VITE_SUPABASE_URL=https://...</p>
            <p>VITE_SUPABASE_ANON_KEY=eyJ...</p>
          </div>
          <p className="text-text-dim text-xs mt-4">Running in offline demo mode with Lani's sample data.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUp(email, password, displayName);
        // If email confirmation is required, user won't have a session yet
        if (result?.user && !result.session) {
          setEmailPending(true);
          return;
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      // Supabase returns this when email isn't confirmed yet
      if (err.message?.includes('Email not confirmed')) {
        setEmailPending(true);
      } else if (err.message?.includes('Database error saving new user')) {
        setError('Account created but profile setup failed. Please try signing in — your profile will be created automatically.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Email verification pending screen
  if (emailPending) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u2709\uFE0F'}
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl mb-2">Check your email</h2>
          <p className="text-text-secondary text-sm mb-4">
            We sent a verification link to <span className="text-text-primary font-medium">{email}</span>.
            Click the link to activate your account.
          </p>
          <p className="text-text-dim text-xs mb-6">
            Didn't get it? Check your spam folder, or try signing up again.
          </p>
          <button
            onClick={() => { setEmailPending(false); setIsSignUp(false); setError(''); }}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-text-primary border border-border hover:border-text-dim hover:bg-bg-hover transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Forgot password flow
  if (forgotMode) {
    async function handleReset(e) {
      e.preventDefault();
      if (!email.trim()) return;
      setError('');
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setResetSent(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (resetSent) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
              {'\u2709\uFE0F'}
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl mb-2">Check your email</h2>
            <p className="text-text-secondary text-sm mb-4">
              We sent a password reset link to <span className="text-text-primary font-medium">{email}</span>.
            </p>
            <p className="text-text-dim text-xs mb-6">
              Click the link in the email to set a new password. Check your spam folder if you don't see it.
            </p>
            <button
              onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-text-primary border border-border hover:border-text-dim hover:bg-bg-hover transition-colors"
            >
              Back to Sign In
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
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl">Reset Password</h2>
            <p className="text-text-secondary text-sm mt-1">Enter your email and we'll send a reset link.</p>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
                placeholder="dan@example.com"
                required
                autoFocus
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="text-center text-text-muted text-xs mt-4">
            <button onClick={() => { setForgotMode(false); setError(''); }} className="text-literacy hover:underline">
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full">
        {/* Left side — branding */}
        <div className="hidden md:flex flex-col justify-center flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
              {'\u03B1'}
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">Alpha Learning</h1>
              <p className="text-text-muted text-xs">Personalized Early Childhood Tracker</p>
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Track your child's developmental milestones against international benchmarks.
            Powered by AI insights and the Alpha School 2-hour mastery model.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-bg-card/50 rounded-lg border border-border-light">
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="text-text-primary text-xs font-semibold">{f.title}</p>
                  <p className="text-text-dim text-[10px] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — form */}
        <div className="bg-bg-card border border-border rounded-2xl p-8 w-full md:w-[380px] shrink-0">
          <div className="text-center mb-6">
            <div className="md:hidden w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
              {'\u03B1'}
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {isSignUp ? 'Start tracking your child\'s progress' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-text-secondary text-xs mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
                  placeholder="Dan"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-text-secondary text-xs mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
                placeholder="dan@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-literacy transition-colors"
                placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                required
                minLength={6}
              />
              {!isSignUp && (
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(''); }}
                    className="text-text-muted text-xs hover:text-literacy transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
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
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-literacy hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {/* Demo mode separator */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-dim text-xs">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="text-center mt-3">
            <p className="text-text-muted text-xs mb-2">Just want to look around?</p>
            <button
              onClick={loginAsDemo}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-text-primary border border-border hover:border-text-dim hover:bg-bg-hover transition-colors"
            >
              Try Demo &mdash; no account needed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
