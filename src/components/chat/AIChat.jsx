import { useState, useRef, useEffect } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { MILESTONES } from '../../data/milestones';
import { chatWithAI, buildStudentContext } from '../../lib/ai';
import { setProtectedNames } from '../../lib/pii';
import VoiceInput from '../shared/VoiceInput';

function getQuickQuestions(firstName) {
  return [
    `Where is ${firstName} vs age 5 benchmarks?`,
    "What should we focus on this week?",
    "Is Reading Eggs better in morning or evening?",
    "Generate a 5-day plan for letter learning",
    "Which milestones are closest to completion?",
    `How does ${firstName} compare to NZ school entry expectations?`,
  ];
}

export default function AIChat() {
  const { student, age, milestoneStatus, domainScores } = useStudent();
  const { isDemo, exitDemo } = useAuth();
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const systemPrompt = buildStudentContext(student, age, milestoneStatus, domainScores, MILESTONES);
  const quickQuestions = getQuickQuestions(student.firstName);

  // Set up PII protection for child's name (only child name since parent/teacher names could appear in messages)
  useEffect(() => {
    setProtectedNames([student.firstName]);
  }, [student.firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: 'assistant', content: '', streaming: true }]);
    setStreaming(true);
    setError('');

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      const fullText = await chatWithAI(systemPrompt, apiMessages, {
        onChunk: (chunk, fullSoFar) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: fullSoFar, streaming: true };
            return updated;
          });
        },
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: fullText, streaming: false };
        return updated;
      });
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.slice(0, -1)); // Remove the streaming placeholder
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">
          Ask AI
        </h2>
        <p className="text-text-secondary text-sm mt-1 mb-4">
          Chat with AI about {student.firstName}'s progress. It has access to all milestone data and scores.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
              {'\u03B1'}
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Ask me anything about {student.firstName}'s learning progress!
            </p>
            {/* Quick questions */}
            {!isDemo && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={streaming}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-text-dim transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-literacy/20 border border-literacy/30 text-text-primary'
                : 'bg-bg-card border border-border text-text-secondary'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
                    {'\u03B1'}
                  </div>
                  <span className="text-text-dim text-[10px]">Alpha AI</span>
                  {msg.streaming && <span className="w-1.5 h-1.5 rounded-full bg-literacy animate-pulse" />}
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mb-2 text-red-600 text-xs px-2">{error}</div>
      )}

      {/* Input or demo guard */}
      {isDemo ? (
        <div className="bg-bg-card border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-text-secondary text-sm mb-2">AI Chat is not available in demo mode.</p>
          <button
            onClick={exitDemo}
            className="text-xs px-4 py-2 rounded-lg text-white font-medium"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            Sign up to use this feature
          </button>
        </div>
      ) : (
        <VoiceInput
          onResult={sendMessage}
          placeholder={`Ask about ${student.firstName}'s learning...`}
          className="pb-2"
        />
      )}
    </div>
  );
}
