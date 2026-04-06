import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const PRIMARY_TABS = [
  { path: '/', label: 'Home', icon: '\u{1F3E0}' },
  { path: '/literacy', label: 'Literacy', icon: '\u{1F4D6}' },
  { path: '/numeracy', label: 'Math', icon: '\u{1F522}' },
  { path: '/chat', label: 'Ask AI', icon: '\u{1F4AC}' },
];

const MORE_TABS = [
  { path: '/social', label: 'Social-Emotional', icon: '\u{1F49B}' },
  { path: '/motor', label: 'Motor Skills', icon: '\u270B' },
  { path: '/schedule', label: 'Schedule', icon: '\u{1F552}' },
  { path: '/blueprint', label: 'Weekly Blueprint', icon: '\u{1F4CB}' },
  { path: '/docs', label: 'Documents', icon: '\u{1F4C1}' },
  { path: '/printables', label: 'Printables', icon: '\u{1F5A8}\uFE0F' },
  { path: '/assessment', label: 'Assessment', icon: '\u2705' },
  { path: '/flashcards', label: 'Flashcards', icon: '\u{1F0CF}' },
  { path: '/insights', label: 'AI Insights', icon: '\u{1F4A1}' },
  { path: '/methodology', label: 'How We Measure', icon: '\u{1F4CA}' },
  { path: '/settings', label: 'Settings', icon: '\u2699\uFE0F' },
];

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-[68px] left-3 right-3 bg-bg-card border border-border rounded-xl p-4 grid grid-cols-3 gap-3"
            onClick={e => e.stopPropagation()}
          >
            {MORE_TABS.map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-h-[56px] py-3 px-2 rounded-xl transition-colors ${
                    isActive ? 'text-text-primary bg-bg-hover' : 'text-text-dim'
                  }`
                }
              >
                <span className="text-2xl leading-none">{tab.icon}</span>
                <span className="text-[11px] mt-1.5 text-center leading-tight">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-card border-t border-border safe-area-pb">
        <div className="flex justify-around items-center">
          {PRIMARY_TABS.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[52px] min-w-[52px] py-2 px-3 ${
                  isActive ? 'text-text-primary' : 'text-text-dim'
                }`
              }
            >
              <span className="text-[22px] leading-none">{tab.icon}</span>
              <span className="text-[11px] mt-1 truncate">{tab.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center min-h-[52px] min-w-[52px] py-2 px-3 ${showMore ? 'text-text-primary' : 'text-text-dim'}`}
          >
            <span className="text-[22px] leading-none">{'\u2022\u2022\u2022'}</span>
            <span className="text-[11px] mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
