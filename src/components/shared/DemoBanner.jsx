import { useAuth } from '../../hooks/useAuth';

export default function DemoBanner() {
  const { isDemo, exitDemo } = useAuth();

  if (!isDemo) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium">
      You're viewing a demo &mdash;{' '}
      <button
        onClick={exitDemo}
        className="underline hover:no-underline font-semibold"
      >
        Sign up
      </button>
      {' '}to track your own child's progress
    </div>
  );
}
