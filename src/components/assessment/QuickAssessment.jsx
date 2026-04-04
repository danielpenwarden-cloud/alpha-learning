import { useState } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { MILESTONES } from '../../data/milestones';
import { DOMAINS } from '../../data/domains';

function getQuestionTemplates(name) {
  return {
    literacy: [
      { milestoneId: 'L03', question: `Show letter flashcards \u2014 how many uppercase letters did ${name} identify?`, type: 'number', max: 26, unit: '/26 letters' },
      { milestoneId: 'L04', question: 'Show letters and ask "what sound does this make?" \u2014 how many correct?', type: 'number', max: 26, unit: '/26 sounds' },
      { milestoneId: 'L05', question: 'Ask "do cat and hat rhyme?" and "what rhymes with sun?" \u2014 did they get it?', type: 'yesno' },
      { milestoneId: 'L06', question: `Say "butterfly" \u2014 can ${name} clap the syllables (3 claps)?`, type: 'yesno' },
      { milestoneId: 'L07', question: 'Ask "what sound does fish start with?" \u2014 can they isolate initial sounds?', type: 'scale', labels: ['Not yet', 'Sometimes', 'Mostly', 'Always'] },
      { milestoneId: 'L08', question: 'Flash these sight words: I, a, the, is, my \u2014 how many read instantly?', type: 'number', max: 5, unit: '/5 words' },
      { milestoneId: 'L09', question: 'After reading a story, can they retell beginning, middle, end?', type: 'scale', labels: ['Not yet', 'With help', 'Mostly', 'Independently'] },
      { milestoneId: 'L10', question: 'Ask 5 comprehension questions about a story \u2014 how many answered?', type: 'number', max: 5, unit: '/5 questions' },
    ],
    numeracy: [
      { milestoneId: 'N03', question: 'Show number flashcards 0-10 \u2014 how many numerals identified?', type: 'number', max: 11, unit: '/11 numbers' },
      { milestoneId: 'N04', question: `Ask ${name} to count as high as they can \u2014 what number did they reach?`, type: 'number', max: 30, unit: 'highest count' },
      { milestoneId: 'N06', question: 'Show two groups: "which has more? which has fewer?" \u2014 correct?', type: 'scale', labels: ['Not yet', '"More" only', 'Both mostly', 'All correct'] },
      { milestoneId: 'N07', question: '"Put the bear behind the box, between the cups" \u2014 follows spatial directions?', type: 'number', max: 8, unit: '/8 directions' },
      { milestoneId: 'N08', question: 'Make a red-blue-red-blue pattern \u2014 can they continue it?', type: 'yesno' },
      { milestoneId: 'N09', question: 'Give mixed objects \u2014 can they sort them into groups by color/shape?', type: 'scale', labels: ['Not yet', 'One attribute', 'Two attributes', 'Independently'] },
      { milestoneId: 'N10', question: 'Ask them to write numbers 1-10 \u2014 how many are legible?', type: 'number', max: 10, unit: '/10 numbers' },
      { milestoneId: 'N12', question: '"Which is taller? Which is heavier?" \u2014 uses comparison words?', type: 'scale', labels: ['Not yet', '1-2 words', '3-4 words', '5+ words'] },
    ],
    social: [
      { milestoneId: 'S01', question: 'During a frustrating task today \u2014 did they self-regulate?', type: 'scale', labels: ['Needed lots of help', 'Some help', 'Mostly self-calmed', 'Fully self-regulated'] },
      { milestoneId: 'S03', question: 'Multi-step task (bag, shoes, door) \u2014 completed without reminders?', type: 'scale', labels: ['Needed reminders each step', 'One reminder', 'All steps independently', 'Plus extras'] },
      { milestoneId: 'S04', question: 'Did they notice/respond when someone was upset this week?', type: 'yesno' },
      { milestoneId: 'S05', question: 'Give a 3-step direction \u2014 did they follow all steps?', type: 'scale', labels: ['0-1 steps', '2 steps', 'All 3', '3+ steps'] },
      { milestoneId: 'S07', question: 'On a hard task, did they persist or give up quickly?', type: 'scale', labels: ['Gave up immediately', 'Tried once', 'Tried a few times', 'Kept going'] },
      { milestoneId: 'S08', question: 'Did they verbally express needs/feelings clearly today?', type: 'yesno' },
    ],
    motor: [
      { milestoneId: 'M01', question: 'Observe pencil grip during writing \u2014 which grip?', type: 'scale', labels: ['Fist grip', 'Transitional', 'Mostly tripod', 'Consistent tripod'] },
      { milestoneId: 'M02', question: `Ask them to write "${name.toUpperCase()}" \u2014 legibility on a scale:`, type: 'scale', labels: ['Unreadable', 'Some letters clear', 'Mostly readable', 'Neat and on line'] },
      { milestoneId: 'M03', question: 'Cut along a printed line \u2014 accuracy?', type: 'scale', labels: ['Can\'t follow', '>1cm off', 'Within 5mm', 'On the line'] },
      { milestoneId: 'M04', question: 'Draw a person \u2014 how many body parts?', type: 'number', max: 12, unit: 'body parts' },
      { milestoneId: 'M08', question: 'Color a picture \u2014 stayed within lines?', type: 'scale', labels: ['Mostly outside', 'Half in/out', 'Mostly inside', 'All inside'] },
    ],
  };
}

export default function QuickAssessment() {
  const { student, updateMilestone, milestoneStatus } = useStudent();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  const QUESTION_TEMPLATES = getQuestionTemplates(student.firstName);

  function startAssessment(domainId) {
    setSelectedDomain(domainId);
    setAnswers({});
    setSubmitted(false);
  }

  function setAnswer(milestoneId, value) {
    setAnswers(prev => ({ ...prev, [milestoneId]: value }));
  }

  function submitAssessment() {
    const questions = QUESTION_TEMPLATES[selectedDomain] || [];

    questions.forEach(q => {
      const answer = answers[q.milestoneId];
      if (answer === undefined) return;

      let progress;
      if (q.type === 'number') {
        progress = Math.round((answer / q.max) * 100);
      } else if (q.type === 'yesno') {
        progress = answer ? Math.max((milestoneStatus[q.milestoneId]?.progress || 0) + 15, 50) : milestoneStatus[q.milestoneId]?.progress || 0;
      } else if (q.type === 'scale') {
        progress = Math.round((answer / (q.labels.length - 1)) * 100);
      }

      if (progress !== undefined) {
        let status = 'not-started';
        if (progress >= 90) status = 'mastered';
        else if (progress >= 75) status = 'proficient';
        else if (progress >= 25) status = 'in-progress';
        else if (progress > 0) status = 'emerging';

        updateMilestone(q.milestoneId, { progress, status });
      }
    });

    setSubmitted(true);
    setAssessmentHistory(prev => [{
      domain: selectedDomain,
      date: new Date().toLocaleDateString(),
      questionsAnswered: Object.keys(answers).length,
    }, ...prev]);
  }

  const domain = DOMAINS.find(d => d.id === selectedDomain);
  const questions = selectedDomain ? (QUESTION_TEMPLATES[selectedDomain] || []) : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">
          Quick Assessment
        </h2>
        <p className="text-text-secondary text-sm mt-1 mb-4">
          5-minute micro-assessments to update {student.firstName}'s milestone progress.
        </p>
      </div>

      {/* Domain selector */}
      {!selectedDomain && (
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {DOMAINS.map(d => (
            <button
              key={d.id}
              onClick={() => startAssessment(d.id)}
              className="bg-bg-card border border-border rounded-xl p-4 md:p-5 text-left hover:border-text-dim transition-colors flex items-center gap-3 md:gap-4"
            >
              <span className="text-2xl md:text-3xl shrink-0">{d.icon}</span>
              <div>
                <h3 className="text-text-primary text-sm md:text-base font-semibold">{d.name}</h3>
                <p className="text-text-dim text-xs md:text-sm mt-0.5">
                  {(QUESTION_TEMPLATES[d.id] || []).length} questions &middot; ~5 min
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Assessment flow */}
      {selectedDomain && !submitted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{domain?.icon}</span>
              <h3 className="text-text-primary text-sm font-semibold">{domain?.name} Assessment</h3>
            </div>
            <button onClick={() => setSelectedDomain(null)} className="text-text-dim text-xs hover:text-text-muted">
              Cancel
            </button>
          </div>

          {questions.map((q, i) => (
            <div key={q.milestoneId} className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-text-dim text-xs font-mono">{q.milestoneId}</span>
                <p className="text-text-primary text-sm">{q.question}</p>
              </div>

              {q.type === 'number' && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={q.max}
                    value={answers[q.milestoneId] ?? 0}
                    onChange={e => setAnswer(q.milestoneId, parseInt(e.target.value))}
                    className="flex-1 accent-literacy"
                  />
                  <span className="text-text-primary text-sm font-mono w-20 text-right">
                    {answers[q.milestoneId] ?? 0} {q.unit}
                  </span>
                </div>
              )}

              {q.type === 'yesno' && (
                <div className="flex gap-2">
                  {[false, true].map(val => (
                    <button
                      key={String(val)}
                      onClick={() => setAnswer(q.milestoneId, val)}
                      className={`text-xs px-4 py-1.5 rounded-lg border transition-colors ${
                        answers[q.milestoneId] === val
                          ? val ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'
                          : 'border-border text-text-dim'
                      }`}
                    >
                      {val ? 'Yes' : 'No / Not yet'}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'scale' && (
                <div className="flex flex-wrap gap-1.5">
                  {q.labels.map((label, j) => (
                    <button
                      key={j}
                      onClick={() => setAnswer(q.milestoneId, j)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        answers[q.milestoneId] === j
                          ? 'border-literacy text-literacy bg-literacy/10'
                          : 'border-border text-text-dim hover:text-text-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={submitAssessment}
            disabled={Object.keys(answers).length === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            Submit Assessment ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        </div>
      )}

      {/* Results */}
      {submitted && (
        <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
          <span className="text-3xl">{'\u2705'}</span>
          <h3 className="text-text-primary text-lg font-semibold mt-2">Assessment Complete!</h3>
          <p className="text-text-secondary text-sm mt-1">
            {Object.keys(answers).length} milestones updated in {domain?.name}.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setSelectedDomain(null)}
              className="text-xs px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary"
            >
              Assess Another Domain
            </button>
            <button
              onClick={() => startAssessment(selectedDomain)}
              className="text-xs px-4 py-2 rounded-lg border border-literacy text-literacy hover:bg-literacy/10"
            >
              Redo {domain?.name}
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {assessmentHistory.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h3 className="text-text-primary text-sm font-semibold mb-3">Recent Assessments</h3>
          <div className="space-y-2">
            {assessmentHistory.map((a, i) => {
              const d = DOMAINS.find(dom => dom.id === a.domain);
              return (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{d?.icon}</span>
                    <span className="text-text-primary text-sm">{d?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-dim">
                    <span>{a.questionsAnswered} questions</span>
                    <span>{a.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
