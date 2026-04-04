import { useStudent, calcAge } from '../../hooks/useStudent';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';

export default function TopBar() {
  const { student, students, activeStudentId, setActiveStudentId, age, isOnline } = useStudent();
  const { user, isDemo, exitDemo } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-bg-card/90 backdrop-blur-sm border-b border-border px-4 py-3 md:py-4 flex items-center justify-between" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
      <div className="flex items-center gap-3">
        {/* Mobile logo */}
        <div className="md:hidden w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
          {'\u03B1'}
        </div>
        <div>
          {students.length > 1 ? (
            <select
              value={activeStudentId || ''}
              onChange={e => setActiveStudentId(e.target.value)}
              className="font-[family-name:var(--font-display)] text-text-primary text-base md:text-xl bg-transparent border-none focus:outline-none cursor-pointer pr-6 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' }}
            >
              {students.map(s => {
                const sAge = calcAge(s.dateOfBirth);
                return (
                  <option key={s.id} value={s.id}>
                    {s.firstName}'s Dashboard ({sAge.years}yr {sAge.months}mo)
                  </option>
                );
              })}
            </select>
          ) : (
            <h1 className="font-[family-name:var(--font-display)] text-text-primary text-base md:text-xl">
              {student.firstName}'s Dashboard
            </h1>
          )}
          <p className="text-text-muted text-xs md:text-sm">
            {age.years}yr {age.months}mo &middot; {student.schoolName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Connection status dot */}
        <span
          className={`w-2 h-2 rounded-full hidden sm:block ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}
          title={isOnline ? 'Connected' : 'Offline mode'}
        />
        <span className="text-text-secondary text-xs hidden sm:block">
          {user?.user_metadata?.display_name || user?.email || ''}
        </span>
        <button
          onClick={() => isDemo ? exitDemo() : signOut()}
          className="text-text-dim hover:text-text-secondary text-xs px-2 py-1 rounded border border-border hover:border-text-dim transition-colors"
        >
          {isDemo ? 'Exit Demo' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}
