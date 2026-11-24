import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Bug, Repeat, BookOpen, Volume2, Square } from "lucide-react";
import { Shell, Panel } from "@/components/jervis/Shell";
import { CodeEditor, LANGS, type LangId } from "@/components/jervis/CodeEditor";
import { Markdown } from "@/components/jervis/Markdown";
import { LangToggle, VoicePicker } from "@/components/jervis/Controls";
import { useJervisChat, textOf } from "@/hooks/use-jervis-chat";
import { useVoice, type Lang } from "@/hooks/use-voice";
import type { JervisMode } from "@/lib/ai/prompts";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Code Lab — JERVIS" },
      { name: "description", content: "Write, run, debug, explain and convert code in C, C++, Java, JS, TS, Python and SQL with JERVIS." },
      { property: "og:title", content: "JERVIS Code Lab" },
      { property: "og:description", content: "Editor with runner, bug checker, line-by-line explainer and language converter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

const SAMPLE: Record<LangId, string> = {
  c: '#include <stdio.h>\n\nint main() {\n    int sum = 0;\n    for (int i = 1; i <= 5; i++) {\n        sum += i;\n    }\n    printf("Sum = %d\\n", sum);\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a[] = {5, 2, 9, 1};\n    int n = 4;\n    for (int i = 0; i < n - 1; i++)\n        for (int j = 0; j < n - i - 1; j++)\n            if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);\n    for (int x : a) cout << x << " ";\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        int n = 5, fact = 1;\n        for (int i = 2; i <= n; i++) fact *= i;\n        System.out.println("Factorial: " + fact);\n    }\n}',
  javascript: 'function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}\nconsole.log(binarySearch([1, 3, 5, 7, 9, 11], 7));',
  typescript: 'type Student = { name: string; marks: number };\nconst list: Student[] = [{ name: "Nafi", marks: 92 }, { name: "Rafi", marks: 78 }];\nconst top = list.reduce((a, b) => (a.marks > b.marks ? a : b));\nconsole.log(`Top: ${top.name}`);',
  python: 'def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=" ")\n        a, b = b, a + b\n\nfib(8)',
  sql: 'CREATE TABLE students (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  dept_id INT REFERENCES departments(id)\n);\n\nSELECT s.name, d.name AS dept\nFROM students s\nJOIN departments d ON d.id = s.dept_id\nWHERE d.name = \'CSE\';',
};

function runJs(code: string): { out: string; error?: string } {
  const logs: string[] = [];
  const fmt = (a: unknown[]) => a.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(" ");
  const fake = { log: (...a: unknown[]) => logs.push(fmt(a)), error: (...a: unknown[]) => logs.push("Error: " + fmt(a)), warn: (...a: unknown[]) => logs.push(fmt(a)) };
  try {
    new Function("console", code)(fake);
    return { out: logs.join("\n") || "(no output)" };
  } catch (e) {
    return { out: logs.join("\n"), error: (e as Error).name + ": " + (e as Error).message };
  }
}

function EditorPage() {
  const [lang, setLang] = useState<LangId>("javascript");
  const [code, setCode] = useState(SAMPLE.javascript);
  const [target, setTarget] = useState<LangId>("python");
  const [spoken, setSpoken] = useState<Lang>("en");
  const [mode, setMode] = useState<JervisMode>("explain");
  const [local, setLocal] = useState<{ out: string; error?: string } | null>(null);
  const voice = useVoice(spoken);
  const chat = useJervisChat(mode, { onReply: (t) => (mode === "check" || mode === "explain") && voice.speak(t) });
  const label = LANGS.find((l) => l.id === lang)!.label;
  const reply = [...chat.messages].reverse().find((m) => m.role === "assistant");
  const langNote = spoken === "bn" ? "\n\nPlease answer in Bengali (বাংলা)." : "";

  const fire = (m: JervisMode, prompt: string) => {
    setMode(m);
    chat.setMessages([]);
    voice.stopSpeaking();
    chat.ask(prompt + langNote, m);
  };
  const block = "```" + lang + "\n" + code + "\n```";

  const run = () => {
    setLocal(null);
    if (lang === "javascript") {
      const r = runJs(code);
      setLocal(r);
      if (r.error) fire("check", `This ${label} code threw: ${r.error}\n${block}`);
    } else fire("simulate", `Run this ${label} program and show its output:\n${block}`);
  };

  return (
    <Shell>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Editor" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={lang} onChange={(e) => { const l = e.target.value as LangId; setLang(l); setCode(SAMPLE[l]); }} className="hud-select">
              {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <LangToggle lang={spoken} setLang={setSpoken} />
          </div>
          <VoicePicker voice={voice} className="mb-3 w-full" />
          <CodeEditor value={code} onChange={setCode} lang={lang} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={run} className="hud-btn hud-btn-active"><Play size={15} /> Run</button>
            <button onClick={() => fire("check", `Check this ${label} code for errors:\n${block}`)} className="hud-btn"><Bug size={15} /> Check errors</button>
            <button onClick={() => fire("explain", `Explain this ${label} code line by line:\n${block}`)} className="hud-btn"><BookOpen size={15} /> Explain</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Convert to</span>
            <select value={target} onChange={(e) => setTarget(e.target.value as LangId)} className="hud-select">
              {LANGS.filter((l) => l.id !== lang).map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <button onClick={() => fire("convert", `Convert this ${label} code to ${LANGS.find((l) => l.id === target)!.label}:\n${block}`)} className="hud-btn"><Repeat size={15} /> Convert</button>
          </div>
        </Panel>

        <Panel title={`JERVIS // ${mode}`} className="min-h-[50dvh] min-w-0">
          {local && (
            <div className="mb-3">
              <div className="mb-1 text-[10px] tracking-[0.3em] text-primary">CONSOLE</div>
              <pre className="whitespace-pre-wrap rounded-md border border-primary/20 bg-background/80 p-3 font-mono text-xs">{local.out}{local.error && <span className="text-destructive">{"\n" + local.error}</span>}</pre>
            </div>
          )}
          <div className="mb-2 flex gap-2">
            {reply && <button onClick={() => voice.speak(textOf(reply))} className="hud-btn"><Volume2 size={14} /> Read aloud</button>}
            {(voice.speaking || chat.busy) && <button onClick={() => { voice.stopSpeaking(); chat.stop(); }} className="hud-btn"><Square size={14} /> Stop</button>}
          </div>
          {chat.busy && !reply && <div className="animate-pulse text-sm text-primary">Analyzing…</div>}
          {chat.error && <div className="text-sm text-destructive">{chat.error.message}</div>}
          {reply ? <Markdown>{textOf(reply)}</Markdown> : !chat.busy && !local && <p className="text-sm text-muted-foreground">Run, check, explain or convert your code — JERVIS will respond here and read bug reports aloud.</p>}
        </Panel>
      </div>
    </Shell>
  );
}
