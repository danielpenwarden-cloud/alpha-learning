import { useState, useCallback } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { saveFlashcardSession } from '../../lib/db';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = Array.from({ length: 21 }, (_, i) => i); // 0-20

const DECK_MILESTONE_MAP = {
  alphabet: 'L03', // Alphabet Knowledge - Uppercase
  numbers: 'N03',  // Number Recognition 0-10
};

function progressToStatus(pct) {
  if (pct >= 95) return 'mastered';
  if (pct >= 70) return 'proficient';
  if (pct > 0) return 'in-progress';
  return 'not-started';
}

const DECKS = [
  { id: 'alphabet', label: 'Alphabet', icon: '\u{1F524}', description: 'A\u2013Z uppercase letters', items: ALPHABET },
  { id: 'numbers', label: 'Numbers', icon: '\u{1F522}', description: '0\u201320', items: NUMBERS },
];

function DeckPicker({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl md:text-3xl text-center">
        Flashcards
      </h2>
      <p className="text-text-muted text-sm text-center max-w-sm">
        Tap through each card with your child. Mark each one as known or not known.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {DECKS.map(deck => (
          <button
            key={deck.id}
            onClick={() => onSelect(deck)}
            className="bg-bg-card border border-border rounded-xl p-6 text-left hover:border-text-dim transition-colors"
          >
            <span className="text-4xl">{deck.icon}</span>
            <h3 className="text-text-primary text-lg font-semibold mt-3">{deck.label}</h3>
            <p className="text-text-muted text-sm mt-1">{deck.description}</p>
            <p className="text-text-dim text-xs mt-2">{deck.items.length} cards</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function FlashcardSession({ deck, onFinish }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]); // { item, known: bool }

  const current = deck.items[index];
  const total = deck.items.length;
  const done = index >= total;

  const answer = useCallback((known) => {
    setResults(prev => [...prev, { item: deck.items[index], known }]);
    setIndex(prev => prev + 1);
  }, [index, deck.items]);

  if (done) {
    return <ResultsSummary deck={deck} results={results} onFinish={onFinish} />;
  }

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onFinish}
            className="text-text-muted text-sm hover:text-text-primary transition-colors"
          >
            &larr; Back
          </button>
          <span className="text-text-primary text-sm font-medium">{index + 1}/{total}</span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((index + 1) / total) * 100}%`,
              background: 'linear-gradient(90deg, #f97316, #0ea5e9)',
            }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md aspect-[3/4] flex items-center justify-center shadow-lg">
          <span
            className="font-[family-name:var(--font-display)] text-text-primary select-none"
            style={{ fontSize: 'min(200px, 40vw)', lineHeight: 1 }}
          >
            {String(current)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-8 px-4 pb-8 pt-4">
        <button
          onClick={() => answer(false)}
          className="flex items-center justify-center rounded-full transition-transform active:scale-95 shadow-lg"
          style={{
            width: 72,
            height: 72,
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: 32,
          }}
          aria-label="Doesn't know"
        >
          &#x2717;
        </button>
        <button
          onClick={() => answer(true)}
          className="flex items-center justify-center rounded-full transition-transform active:scale-95 shadow-lg"
          style={{
            width: 72,
            height: 72,
            backgroundColor: '#22c55e',
            color: 'white',
            fontSize: 32,
          }}
          aria-label="Knows"
        >
          &#x2713;
        </button>
      </div>
    </div>
  );
}

function ResultsSummary({ deck, results, onFinish }) {
  const { student, updateMilestone } = useStudent();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const correct = results.filter(r => r.known);
  const incorrect = results.filter(r => !r.known);

  const handleSave = useCallback(async () => {
    if (saved || saving) return;
    setSaving(true);

    const pct = Math.round((correct.length / results.length) * 100);

    // Save flashcard session
    await saveFlashcardSession(student.id, user?.id, {
      deckId: deck.id,
      results: results.map(r => ({ item: String(r.item), known: r.known })),
      correctCount: correct.length,
      totalCount: results.length,
    });

    // Update the linked milestone with the new score
    const milestoneId = DECK_MILESTONE_MAP[deck.id];
    if (milestoneId) {
      const knownList = correct.map(r => String(r.item)).join(', ');
      const unknownList = incorrect.map(r => String(r.item)).join(', ');
      const note = `Flashcard ${deck.label}: ${correct.length}/${results.length} (${pct}%). Known: ${knownList}${unknownList ? '. Needs practice: ' + unknownList : ''}`;
      updateMilestone(milestoneId, {
        progress: pct,
        status: progressToStatus(pct),
        evidenceNotes: note,
      });
    }

    setSaving(false);
    setSaved(true);
  }, [saved, saving, student.id, user, deck.id, results, correct.length, incorrect, updateMilestone]);

  // Auto-save on mount
  useState(() => { handleSave(); });

  const pct = Math.round((correct.length / results.length) * 100);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto">
      <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl mb-2">
        Results
      </h2>
      <p className="text-text-muted text-sm mb-6">
        {deck.label} &middot; {correct.length}/{results.length} correct ({pct}%)
      </p>

      {/* Score ring */}
      <div className="relative w-32 h-32 mb-6">
        <svg width={128} height={128} className="-rotate-90">
          <circle cx={64} cy={64} r={54} fill="none" stroke="var(--color-border)" strokeWidth={10} />
          <circle
            cx={64} cy={64} r={54} fill="none"
            stroke={pct >= 70 ? '#22c55e' : pct >= 40 ? '#f97316' : '#ef4444'}
            strokeWidth={10}
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 * (1 - pct / 100)}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-[family-name:var(--font-display)] text-text-primary text-3xl">{pct}%</span>
        </div>
      </div>

      {/* Known items */}
      {correct.length > 0 && (
        <div className="w-full mb-4">
          <h3 className="text-green-500 text-sm font-semibold mb-2">
            Known ({correct.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {correct.map((r, i) => (
              <span key={i} className="bg-green-500/15 text-green-400 rounded-lg px-3 py-1 text-sm font-medium">
                {String(r.item)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unknown items */}
      {incorrect.length > 0 && (
        <div className="w-full mb-6">
          <h3 className="text-red-500 text-sm font-semibold mb-2">
            Needs Practice ({incorrect.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {incorrect.map((r, i) => (
              <span key={i} className="bg-red-500/15 text-red-400 rounded-lg px-3 py-1 text-sm font-medium">
                {String(r.item)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Save status */}
      <p className="text-text-dim text-xs mb-4">
        {saving ? 'Saving...' : saved ? 'Results saved' : 'Saving results...'}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onFinish}
          className="px-5 py-2.5 rounded-lg border border-border text-text-primary text-sm hover:bg-bg-hover transition-colors"
        >
          Back to Decks
        </button>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState(null);

  if (!activeDeck) {
    return <DeckPicker onSelect={setActiveDeck} />;
  }

  return (
    <FlashcardSession
      key={activeDeck.id}
      deck={activeDeck}
      onFinish={() => setActiveDeck(null)}
    />
  );
}
