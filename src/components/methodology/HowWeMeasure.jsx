import { METHODOLOGY } from '../../data/methodology';

export default function HowWeMeasure() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-text-primary" style={{ fontSize: '28px' }}>
          How We Measure
        </h2>
        <p className="text-text-secondary mt-2" style={{ fontSize: '16px', lineHeight: '1.6' }}>{METHODOLOGY.intro}</p>
      </div>

      {/* Frameworks */}
      <div className="space-y-4">
        {METHODOLOGY.frameworks.map(fw => (
          <div key={fw.id} className="bg-bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: '28px' }}>{fw.flag}</span>
              <div>
                <h3 className="text-text-primary font-semibold" style={{ fontSize: '22px' }}>{fw.name}</h3>
                <span
                  className="px-2 py-0.5 rounded border mt-1 inline-block"
                  style={{ color: fw.color, borderColor: fw.color + '40', fontSize: '13px' }}
                >
                  {fw.id === 'us' ? 'Primary Benchmark' : 'Secondary Benchmark'}
                </span>
              </div>
            </div>
            <p className="text-text-secondary mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>{fw.description}</p>

            <div className="space-y-3">
              {fw.sources.map((src, i) => (
                <div key={i} className="pl-4 border-l-2 border-border-light">
                  <p className="text-text-primary font-medium" style={{ fontSize: '16px' }}>{src.name}</p>
                  <p className="text-text-muted mt-0.5" style={{ fontSize: '15px', lineHeight: '1.5' }}>{src.description}</p>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="text-literacy hover:underline mt-1 inline-block" style={{ fontSize: '14px' }}>
                      Learn more &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scoring Methodology */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="text-text-primary font-semibold mb-4" style={{ fontSize: '22px' }}>
          {METHODOLOGY.scoringMethodology.title}
        </h3>
        <div className="space-y-4">
          {METHODOLOGY.scoringMethodology.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-text-muted font-semibold uppercase tracking-wide mb-1" style={{ fontSize: '14px' }}>
                {section.heading}
              </h4>
              <p className="text-text-secondary" style={{ fontSize: '16px', lineHeight: '1.6' }}>{section.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* vs Age 5 Explanation */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="text-text-primary font-semibold mb-2" style={{ fontSize: '22px' }}>
          {METHODOLOGY.vs5yrExplanation.title}
        </h3>
        <p className="text-text-secondary" style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {METHODOLOGY.vs5yrExplanation.content}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-orange-700 font-semibold mb-2 flex items-center gap-2" style={{ fontSize: '22px' }}>
          {'\u26A0\uFE0F'} {METHODOLOGY.disclaimer.title}
        </h3>
        <p className="text-orange-800" style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {METHODOLOGY.disclaimer.content}
        </p>
      </div>
    </div>
  );
}
