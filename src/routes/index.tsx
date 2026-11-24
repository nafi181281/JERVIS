import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff, Square, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Shell, Panel } from "@/components/jervis/Shell";
import { Core } from "@/components/jervis/Core";
import { Markdown } from "@/components/jervis/Markdown";
import { LangToggle, VoicePicker } from "@/components/jervis/Controls";
import { useVoice, type Lang } from "@/hooks/use-voice";
import { useJervisChat, textOf } from "@/hooks/use-jervis-chat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JERVIS — AI FOR NAFI | Voice coding mentor" },
      { name: "description", content: "Talk to JERVIS in Bengali or English: an Iron Man-style AI mentor for code, algorithms and databases." },
      { property: "og:title", content: "JERVIS — AI FOR NAFI" },
      { property: "og:description", content: "Bilingual voice AI coding mentor with a holographic core." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const SUGGEST = [
  "Explain binary search with a loop trace and Big-O",
  "বাংলায় বুঝাও: linked list কী?",
  "How do I connect to NeonDB from Node.js?",
  "Difference between C++ pointers and Java references",
];

function Home() {
  const [lang, setLangState] = useState<Lang>("bn");
  const [voiceOut, setVoiceOut] = useState(true);
  const [input, setInput] = useState("");
  useEffect(() => { const saved = localStorage.getItem("jervis-lang"); if (saved === "en" || saved === "bn") setLangState(saved); }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("jervis-lang", l); };
  const voice = useVoice(lang);
  const chat = useJervisChat("tutor", {
    storageKey: "jervis-main-chat",
    lang,
    onReply: (text) => { if (voiceOut) voice.speak(text); },
  });
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chat.messages.length && logRef.current) logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages]);

  const send = (text: string) => { if (!text.trim() || chat.busy) return; voice.unlock(); chat.ask(text); setInput(""); };
  const toggleMic = () => (voice.listening ? voice.stopListening() : voice.listen(send));
  const status = voice.listening ? "LISTENING…" : chat.busy ? "PROCESSING…" : voice.speaking ? "SPEAKING…" : "AT YOUR SERVICE";

  return (
    <Shell onMic={toggleMic} micActive={voice.listening} hideMobileHeader>
      <div className="mx-auto flex max-w-xl flex-col gap-3">
        <section className="core-stage relative -mx-3 flex flex-col items-center px-4 pt-3 sm:mx-0 sm:rounded-xl">
          <div className="relative z-10 flex w-full items-start justify-between text-[9px] uppercase leading-tight tracking-[0.18em]">
            <span className="text-muted-foreground">A better<br />you every day</span>
            <span className="text-right text-primary/80">"Ideas build<br />a brighter tomorrow"</span>
          </div>
          <h1 className="relative z-10 mt-1 font-display text-4xl font-bold tracking-[0.18em] text-primary glow-text sm:text-5xl">JERVIS</h1>
          <p className="relative z-10 font-display text-[11px] tracking-[0.5em] text-muted-foreground">AI FOR NAFI</p>
          <button type="button" onClick={toggleMic} className="relative flex w-full max-w-[360px] justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={voice.listening ? "Stop listening" : "Talk to JERVIS"}>
            <Core levelRef={voice.levelRef} active={chat.busy || voice.listening || voice.speaking} size={340} />
          </button>
          <p className="relative z-10 -mt-3 font-display text-[10px] tracking-[0.3em] text-primary" aria-live="polite">{voice.interim || status}</p>
        </section>

        <form onSubmit={(event) => { event.preventDefault(); send(input); }}
          className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-background/70 px-4 py-1.5 shadow-[0_0_20px_oklch(0.78_0.16_65_/_12%)] backdrop-blur">
          <input value={input} onChange={(event) => setInput(event.target.value)}
            placeholder={lang === "bn" ? "যেকোনো কিছু জিজ্ঞাসা করুন…" : "Ask anything. Build anything."} aria-label="Message JERVIS"
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground" />
          {chat.busy
            ? <button type="button" onClick={() => chat.stop()} className="grid h-10 w-10 place-items-center text-primary" aria-label="Stop answer"><Square size={18} /></button>
            : <button type="submit" className="grid h-10 w-10 place-items-center text-primary" aria-label="Send message"><ArrowRight size={22} /></button>}
        </form>

        <Panel className="flex min-w-0 flex-col p-0">
          <div className="flex items-center justify-between gap-2 border-b border-primary/20 px-4 py-2.5">
            <h2 className="font-display text-[11px] uppercase tracking-[0.22em] text-foreground">Real-time assist</h2>
            <div className="flex items-center gap-1">
              <LangToggle lang={lang} setLang={setLang} />
              <button type="button" onClick={() => { setVoiceOut(!voiceOut); voice.stopSpeaking(); }} className="grid h-8 w-8 place-items-center text-primary" aria-pressed={voiceOut} aria-label={voiceOut ? "Mute voice" : "Unmute voice"}>
                {voiceOut ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button type="button" aria-label="Clear chat" onClick={() => { voice.stopSpeaking(); chat.setMessages([]); localStorage.removeItem("jervis-main-chat"); }} className="grid h-8 w-8 place-items-center text-muted-foreground"><Trash2 size={15} /></button>
            </div>
          </div>
          <div ref={logRef} className="chat-scroll max-h-[46dvh] min-h-48 space-y-4 overflow-y-auto px-4 py-3">
            {chat.messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground">{lang === "bn" ? "শুভ দিন, স্যার। আমি JERVIS, আপনার সেবায়। কোড, অ্যালগরিদম বা ডাটাবেস — যা খুশি জিজ্ঞাসা করুন।" : "Good day, Sir. I am JERVIS, at your service. Ask me anything about code, algorithms, or databases."}</p>
                <div className="grid gap-2">
                  {SUGGEST.map((suggestion) => <button type="button" key={suggestion} onClick={() => send(suggestion)} className="hud-chip text-left">{suggestion}</button>)}
                </div>
              </div>
            )}
            {chat.messages.map((message) => message.role === "user" ? (
              <div key={message.id} className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-primary-foreground">{textOf(message)}</div>
            ) : (
              <div key={message.id} className="min-w-0">
                <div className="mb-1 flex items-center gap-2 font-display text-[10px] tracking-[0.3em] text-primary">
                  JERVIS
                  <button type="button" onClick={() => voice.speak(textOf(message))} className="grid min-h-8 min-w-8 place-items-center rounded-md text-primary/70 hover:bg-primary/10" aria-label="Read answer aloud"><Volume2 size={14} /></button>
                </div>
                <Markdown>{textOf(message)}</Markdown>
              </div>
            ))}
            {chat.status === "submitted" && <div className="animate-pulse text-sm text-primary">JERVIS is thinking…</div>}
            {chat.error && <div className="text-sm text-destructive">{chat.error.message || "Something went wrong."}</div>}
          </div>
          <div className="flex items-center justify-between border-t border-primary/20 px-4 py-2 font-display text-[9px] tracking-[0.2em]">
            <span className="flex items-center gap-2 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" /> JERVIS IS ONLINE</span>
            <span className="text-muted-foreground">THINK. BUILD. EVOLVE.</span>
          </div>
        </Panel>

        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={toggleMic} className={`hud-btn ${voice.listening ? "hud-btn-active" : ""}`}>
            {voice.listening ? <MicOff size={17} /> : <Mic size={17} />} {voice.listening ? "Stop" : "Speak"}
          </button>
          {voice.speaking && <button type="button" onClick={voice.stopSpeaking} className="hud-btn"><Square size={15} /> Hush</button>}
        </div>
        {voice.speaking && <button type="button" onClick={voice.stopSpeaking} className="hud-btn self-center md:hidden"><Square size={15} /> Hush</button>}
        <VoicePicker voice={voice} />
      </div>
    </Shell>
  );
}
