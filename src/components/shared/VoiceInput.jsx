import { useState, useRef } from 'react';

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function VoiceInput({ onResult, placeholder = 'Type or speak...', className = '' }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  function startListening() {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setText(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function handleSubmit() {
    if (text.trim()) {
      onResult(text.trim());
      setText('');
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1 relative">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2 pr-10 text-text-primary text-sm focus:outline-none focus:border-literacy"
        />
        {SpeechRecognition && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-lg transition-colors ${
              isListening ? 'text-red-600 animate-pulse' : 'text-text-dim hover:text-text-secondary'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? '\u{1F534}' : '\u{1F3A4}'}
          </button>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
      >
        Send
      </button>
    </div>
  );
}
