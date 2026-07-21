'use client';

import { FormEvent, useRef, useState } from 'react';
import { Mail, Mic, MicOff, Send, Sparkles, Volume2 } from 'lucide-react';

type Message = {
  id: number;
  sender: 'student' | 'aarya';
  text: string;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function createReply(input: string) {
  const text = input.toLowerCase();

  if (text.includes('fee') || text.includes('cost') || text.includes('price')) {
    return 'Our B.Tech programme starts at ₹1,25,000 per year. Scholarships are available after an eligibility review. Would you like a counsellor to contact you?';
  }
  if (text.includes('admission') || text.includes('apply') || text.includes('eligibility')) {
    return 'Admissions are open for the upcoming session. Please tell me the programme you are interested in and your latest qualification.';
  }
  if (text.includes('hostel')) {
    return 'Separate hostel facilities are available for students. I can arrange a call with admissions for current room and fee details.';
  }
  if (text.includes('hindi') || text.includes('हिंदी')) {
    return 'जी हाँ, मैं हिंदी में आपकी मदद कर सकती हूँ। आप किस कोर्स के बारे में जानकारी चाहते हैं?';
  }
  if (text.includes('call') || text.includes('counsellor')) {
    return 'Certainly. Please share your preferred day and whether morning or afternoon works better. This demo will flag the request for a human counsellor.';
  }

  return 'I can help with programmes, eligibility, fees, scholarships, hostel information, and counselling appointments. What would you like to know?';
}

export default function AdmissionsDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'aarya',
      text: 'Hello! I’m Aarya, the admissions assistant for Aarohan University. You can type or tap the microphone and speak.',
    },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const nextId = useRef(2);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const submitMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const reply = createReply(trimmed);
    setMessages((current) => [
      ...current,
      { id: nextId.current++, sender: 'student', text: trimmed },
      { id: nextId.current++, sender: 'aarya', text: reply },
    ]);
    setInput('');
    speak(reply);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMessage(input);
  };

  const startVoice = () => {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          sender: 'aarya',
          text: 'Voice recognition is not available in this browser. Please type your question instead.',
        },
      ]);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setInput(transcript);
      submitMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent p-3 text-slate-100">
      <section className="flex h-[620px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold">Aarya · Admissions</h1>
              <p className="text-xs text-emerald-300">Online · Demo mode</p>
            </div>
          </div>
          <Volume2 className="h-5 w-5 text-slate-500" aria-label="Spoken replies enabled" />
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.sender === 'student'
                  ? 'ml-auto bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {['Admissions', 'Fees', 'Hostel', 'हिंदी'].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitMessage(prompt)}
                className="whitespace-nowrap rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about admissions…"
              aria-label="Admissions question"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={startVoice}
              aria-label={listening ? 'Listening' : 'Ask by voice'}
              className={`rounded-xl px-3 ${
                listening ? 'bg-rose-500 text-white' : 'bg-slate-800 text-emerald-300'
              }`}
            >
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button type="submit" aria-label="Send message" className="rounded-xl bg-emerald-600 px-3 text-white">
              <Send className="h-5 w-5" />
            </button>
          </form>
          <a
            href="mailto:admissions@aarohan-demo.edu?subject=Admissions%20enquiry"
            className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-emerald-300"
          >
            <Mail className="h-3.5 w-3.5" /> Continue by email
          </a>
          <p className="mt-2 text-center text-[10px] text-slate-600">Demo employee powered by AgentsHive · No real student data</p>
        </div>
      </section>
    </main>
  );
}
