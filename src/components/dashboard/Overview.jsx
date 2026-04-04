import { useStudent } from '../../hooks/useStudent';
import MiniGauge from './MiniGauge';
import StatCard from './StatCard';
import SundayRecap from './SundayRecap';
import NotificationBanner from '../shared/NotificationBanner';
import WeeklyReportButton from '../exports/WeeklyReportPDF';
import NZPortfolioButton from '../exports/NZPortfolioExport';

export default function Overview() {
  const { student, age, domainStats } = useStudent();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Notification Permission Banner */}
      <NotificationBanner />

      {/* NZ School Readiness Card */}
      <div className="bg-bg-card border border-border rounded-xl p-5 flex items-start gap-3">
        <span className="text-2xl">{'\u{1F1F3}\u{1F1FF}'}</span>
        <div>
          <h3 className="text-text-primary text-sm md:text-base font-semibold">NZ School Readiness</h3>
          <p className="text-text-secondary text-sm mt-1">
            Target: {student.targetSchoolEntry}. {student.firstName} will enter the NZ school system at age 5.
            NZ schools follow Te Wh&#257;riki in ECE, transitioning to NZ Curriculum Level 1.
            The dashboard tracks readiness against NZ, US, AU, and UK/Cambridge benchmarks.
          </p>
        </div>
      </div>

      {/* Percentile Gauges */}
      <div className="bg-bg-card border border-border rounded-xl p-6 md:p-8">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-5 md:mb-6">Domain Scores (vs Own Age)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 justify-items-center">
          {domainStats.map(d => (
            <div key={d.id} className="flex flex-col items-center px-4 py-2">
              <MiniGauge value={d.childScore} color={d.color} label={`vs age`} labelSize="text-sm" />
              <span className="text-text-primary text-sm font-medium mt-3">{d.icon} {d.name.split(' ')[0]}</span>
              <span className="text-text-dim text-sm mt-0.5">
                vs age 5: {d.comparison5yr.us}% US · {d.comparison5yr.uk}% UK
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Summary Cards */}
      <div>
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-3">Domains</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {domainStats.map(d => (
            <StatCard key={d.id} domain={d} />
          ))}
        </div>
      </div>

      {/* Sunday Recap / Weekly Summary */}
      <SundayRecap />

      {/* Export buttons */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-text-primary text-sm md:text-base font-semibold mb-4">Exports</h3>
        <div className="flex flex-wrap gap-3">
          <WeeklyReportButton />
          <NZPortfolioButton />
        </div>
      </div>
    </div>
  );
}
