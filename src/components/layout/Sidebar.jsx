import { NavLink } from 'react-router-dom';
import { useStudent, calcAge } from '../../hooks/useStudent';

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ path: '/', label: 'Overview', icon: '\u{1F3E0}' }],
  },
  {
    label: 'Domains',
    items: [
      { path: '/literacy', label: 'Literacy', icon: '\u{1F4D6}' },
      { path: '/numeracy', label: 'Numeracy', icon: '\u{1F522}' },
      { path: '/social', label: 'Social-Emotional', icon: '\u{1F49B}' },
      { path: '/motor', label: 'Motor Skills', icon: '\u270B' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { path: '/schedule', label: 'Schedule', icon: '\u{1F552}' },
      { path: '/blueprint', label: 'Weekly Blueprint', icon: '\u{1F4CB}' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { path: '/docs', label: 'Documents', icon: '\u{1F4C1}' },
      { path: '/printables', label: 'Printables', icon: '\u{1F5A8}\uFE0F' },
      { path: '/assessment', label: 'Assessment', icon: '\u2705' },
    ],
  },
  {
    label: 'AI',
    items: [
      { path: '/insights', label: 'AI Insights', icon: '\u{1F4A1}' },
      { path: '/chat', label: 'Ask AI', icon: '\u{1F4AC}' },
    ],
  },
  {
    label: null,
    items: [
      { path: '/methodology', label: 'How We Measure', icon: '\u{1F4CA}' },
      { path: '/settings', label: 'Settings', icon: '\u2699\uFE0F' },
    ],
  },
];

export default function Sidebar() {
  const { student, students, activeStudentId, setActiveStudentId, age } = useStudent();

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen fixed left-0 top-0 z-30" style={{ paddingLeft: '8px', backgroundColor: '#2b3a67' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-white/20">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
          {'\u03B1'}
        </div>
        <span className="font-[family-name:var(--font-display)] text-white text-sm">Alpha Learning</span>
      </div>

      {/* Child info */}
      <div className="px-4 py-3 border-b border-white/20">
        {students.length > 1 ? (
          <select
            value={activeStudentId || ''}
            onChange={e => setActiveStudentId(e.target.value)}
            className="w-full text-white text-sm font-semibold bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {students.map(s => {
              const sAge = calcAge(s.dateOfBirth);
              return (
                <option key={s.id} value={s.id}>
                  {s.firstName} ({sAge.years}yr {sAge.months}mo)
                </option>
              );
            })}
          </select>
        ) : (
          <p className="text-white text-sm font-semibold">{student.firstName}</p>
        )}
        <p className="text-white/60 text-xs">{age.years}yr {age.months}mo &middot; {student.schoolName}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-4 pt-4 pb-1 text-white/50 text-[10px] font-semibold uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-white bg-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/20 text-white/50 text-xs">
        Alpha Learning v1.0
      </div>
    </aside>
  );
}
