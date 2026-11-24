import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, MicOff, Send, Flag, RotateCcw, Volume2, Square } from "lucide-react";
import { Shell, Panel } from "@/components/jervis/Shell";
import { Core } from "@/components/jervis/Core";
import { Markdown } from "@/components/jervis/Markdown";
import { LangToggle, VoicePicker } from "@/components/jervis/Controls";
import { useJervisChat, textOf } from "@/hooks/use-jervis-chat";
import { useVoice, type Lang } from "@/hooks/use-voice";

export const Route = createFileRoute("/viva")({
  head: () => ({
    meta: [
      { title: "Viva Simulator — JERVIS" },
      { name: "description", content: "Practice technical viva and interviews with spoken questions, instant feedback and a scorecard." },
      { property: "og:title", content: "JERVIS Viva & Interview Simulator" },
      { property: "og:description", content: "Spoken mock interviews on DSA, OOP, databases and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Viva,
});

const TOPICS = [
  "Data Structures",
  "Algorithms & Big-O",
  "OOP (Java/C++)",
  "C Programming",
  "Python",
  "JavaScript & TypeScript",
  "SQL & PostgreSQL / NeonDB",
  "Operating Systems basics",
];

function Viva() {
  const [lang, setLang] = useState<Lang>("en");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [input, setInput] = useState("");
  const voice = useVoice(lang);
  const chat = useJervisChat("viva", { lang, onReply: (t) => voice.speak(t) });
  const started = chat.messages.length > 0;

  const answer = (t: string) => {
    const val = t.trim();
    if (!val || chat.busy) return;
    voice.unlock();
    voice.stopSpeaking();
    if (voice.listening) voice.stopListening();
    chat.ask(val, "viva");
    setInput("");
  };

  useEffect(() => () => voice.stopSpeaking(), [voice.stopSpeaking]);

  const latestAssistantMessage = [...chat.messages].reverse().find((m) => m.role === "assistant");

  return (
    <Shell>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Panel title="Examiner">
          <div className="core-stage -mx-4 -mt-4 mb-3 flex justify-center px-4">
            <Core levelRef={voice.levelRef} active={chat.busy || voice.listening || voice.speaking} size={300} />
          </div>
          <VoicePicker voice={voice} className="mb-3 w-full" />
          {!started ? (
            <div className="space-y-3">
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="hud-select w-full">
                {TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Language</span>
                <LangToggle lang={lang} setLang={setLang} />
              </div>
              <button
                onClick={() => {
                  voice.unlock();
                  chat.ask(
                    `Start a 5-question viva on "${topic}". ${lang === "bn" ? "Conduct it in Bengali." : "Conduct it in English."}`,
                    "viva",
                  );
                }}
                className="hud-btn hud-btn-active w-full justify-center"
              >
                Begin viva
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => answer("finish — give my scorecard now")} className="hud-btn">
                  <Flag size={15} /> Finish & score
                </button>
                <button
                  onClick={() => {
                    voice.stopSpeaking();
                    chat.setMessages([]);
                  }}
                  className="hud-btn"
                >
                  <RotateCcw size={15} /> New viva
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                {latestAssistantMessage && (
                  <button
                    onClick={() => {
                      voice.unlock();
                      voice.speak(textOf(latestAssistantMessage));
                    }}
                    className="hud-btn text-xs"
                    title="Repeat question"
                  >
                    <Volume2 size={14} /> Repeat question
                  </button>
                )}
                {voice.speaking && (
                  <button onClick={voice.stopSpeaking} className="hud-btn text-xs">
                    <Square size={14} /> Stop
                  </button>
                )}
              </div>
            </div>
          )}
        </Panel>
        <Panel title={started ? `Viva // ${topic}` : "Viva log"} className="flex min-h-[60dvh] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto" style={{ maxHeight: "60dvh" }}>
            {!started && (
              <p className="text-muted-foreground">
                Pick a topic and begin. JERVIS asks questions aloud; answer by voice or typing. You'll get a scorecard at the end.
              </p>
            )}
            {chat.messages.slice(1).map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                  {textOf(m)}
                </div>
              ) : (
                <Markdown key={m.id}>{textOf(m)}</Markdown>
              ),
            )}
            {chat.busy && <div className="animate-pulse text-sm text-primary">Evaluating…</div>}
            {chat.error && <div className="text-sm text-destructive">{chat.error.message}</div>}
          </div>
          {started && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                answer(input || voice.interim);
              }}
              className="mt-3 flex gap-2 border-t border-primary/20 pt-3"
            >
              <button
                type="button"
                onClick={() => {
                  voice.unlock();
                  voice.listening ? voice.stopListening() : voice.listen(answer);
                }}
                className={`hud-btn ${voice.listening ? "hud-btn-active" : ""}`}
              >
                {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input
                value={voice.interim || input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Your answer…"
                className="min-w-0 flex-1 rounded-md border border-primary/30 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button type="submit" className="hud-btn hud-btn-active">
                <Send size={16} />
              </button>
            </form>
          )}
        </Panel>
      </div>
    </Shell>
  );
}
