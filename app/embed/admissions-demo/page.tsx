'use client';

import { FormEvent, useRef, useState } from 'react';
import { CircleAlert, ExternalLink, Mail, Mic, MicOff, Send, Sparkles, Volume2 } from 'lucide-react';

const WIDGET_KEY = 'a0a0a0a0-0000-4000-8000-000000000002';

type Language = 'en' | 'hi';
type Citation = { title: string; url: string };
type Message = { id: number; sender: 'student' | 'aarya'; text: string; citations?: Citation[]; needsHuman?: boolean };
type SpeechRecognitionEventLike = { results: ArrayLike<{ 0: { transcript: string } }> };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; onresult: ((event: SpeechRecognitionEventLike) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export default function AdmissionsDemo() {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, sender: 'aarya', text: 'Hello! I’m Aarya. I can answer from a small set of pre-approved, fictional Aarohan University information. Ask about programmes, admissions or scholarships. I’ll request human help rather than guess.' }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const conversationId = useRef<string | null>(null);
  const nextId = useRef(2);

  const speak = (text: string, speakingLanguage: Language = language) => {
    if (!('speechSynthesis' in window)) return;

    const voiceLocale = speakingLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const languageVoices = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith(voiceLocale.slice(0, 2).toLowerCase()),
    );
    const femaleName = /female|samantha|veena|heera|lekha|kavya|neerja|swara|zira|aria|jenny|ava|susan|victoria/i;
    const naturalName = /natural|neural|premium|enhanced|google|microsoft/i;
    const preferredVoice =
      languageVoices.find((voice) => femaleName.test(voice.name) && naturalName.test(voice.name)) ??
      languageVoices.find((voice) => femaleName.test(voice.name)) ??
      languageVoices.find((voice) => naturalName.test(voice.name)) ??
      languageVoices.find((voice) => voice.localService) ??
      languageVoices[0];

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredVoice?.lang || voiceLocale;
    utterance.voice = preferredVoice || null;
    utterance.rate = speakingLanguage === 'hi' ? 0.86 : 0.88;
    utterance.pitch = 1.06;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const submitMessage = async (value: string) => {
    const question = value.trim();
    if (!question || sending) return;
    setMessages((current) => [...current, { id: nextId.current++, sender: 'student', text: question }]);
    setInput('');
    setSending(true);
    try {
      const response = await fetch('/api/demo/aarya/respond', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ widgetKey: WIDGET_KEY, question, conversationId: conversationId.current, language }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Aarya is unavailable.');
      conversationId.current = result.conversationId;
      setMessages((current) => [...current, { id: nextId.current++, sender: 'aarya', text: result.answer, citations: result.citations, needsHuman: result.needsHuman }]);
      speak(result.answer, language);
    } catch (error) {
      setMessages((current) => [...current, { id: nextId.current++, sender: 'aarya', text: error instanceof Error ? error.message : 'Please contact admissions directly.', needsHuman: true }]);
    } finally { setSending(false); }
  };

  const handleSubmit = (event: FormEvent) => { event.preventDefault(); void submitMessage(input); };
  const startVoice = () => {
    const speechWindow = window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) { setMessages((current) => [...current, { id: nextId.current++, sender: 'aarya', text: 'Voice recognition is unavailable in this browser. Please type your question.' }]); return; }
    const recognition = new Recognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'; recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event) => { const transcript = event.results[0]?.[0]?.transcript ?? ''; setInput(transcript); void submitMessage(transcript); };
    recognition.onend = () => setListening(false); recognition.onerror = () => setListening(false);
    setListening(true); recognition.start();
  };

  return <main className="flex min-h-screen items-center justify-center bg-transparent p-3 text-slate-100">
    <section className="flex h-[620px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300"><Sparkles className="h-5 w-5" /></div><div><h1 className="font-bold">Aarya · Admissions</h1><p className="text-xs text-emerald-300">Female voice · Guided public demo</p></div></div><div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1" aria-label="Aarya speaking language">{(['en', 'hi'] as Language[]).map((option) => <button key={option} type="button" onClick={() => setLanguage(option)} aria-pressed={language === option} className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${language === option ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>{option === 'en' ? 'English' : 'हिंदी'}</button>)}</div></header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">{messages.map((message) => <div key={message.id} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === 'student' ? 'ml-auto bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'}`}><p>{message.text}</p>{message.needsHuman && <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300"><CircleAlert className="h-3.5 w-3.5" /> Human review requested</p>}{message.citations?.map((citation) => <a key={citation.url} href={citation.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200"><ExternalLink className="h-3 w-3" /> {citation.title}</a>)}</div>)}</div>
      <div className="border-t border-slate-800 p-4"><div className="mb-3 flex gap-2 overflow-x-auto">{['BBA programme', 'B.Tech programme', 'Scholarships', 'Talk to a counsellor'].map((prompt) => <button key={prompt} type="button" onClick={() => void submitMessage(prompt)} className="whitespace-nowrap rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500">{prompt}</button>)}</div><form onSubmit={handleSubmit} className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={language === 'hi' ? 'प्रवेश के बारे में पूछें…' : 'Ask about admissions…'} aria-label="Admissions question" disabled={sending} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-emerald-500" /><button type="button" onClick={startVoice} aria-label="Ask by voice" title="Ask by voice" className={`rounded-xl px-3 ${listening ? 'bg-rose-500 text-white' : 'bg-slate-800 text-emerald-300'}`}>{listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}</button><button type="submit" disabled={sending} aria-label="Send message" title="Send message" className="rounded-xl bg-emerald-600 px-3 text-white disabled:opacity-50"><Send className="h-5 w-5" /></button></form><a href="mailto:admissions@aarohan-demo.edu?subject=Admissions%20enquiry" className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-emerald-300"><Mail className="h-3.5 w-3.5" /> Continue with a human</a><p className="mt-2 text-center text-[10px] text-slate-600">Guided demonstration · No paid AI or telephone provider is active</p></div>
    </section>
  </main>;
}
