import EditorMod from "react-simple-code-editor";
const Editor = ((EditorMod as any).default ?? EditorMod) as typeof EditorMod;
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";

export const LANGS = [
  { id: "c", label: "C" }, { id: "cpp", label: "C++" }, { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" }, { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" }, { id: "sql", label: "SQL" },
] as const;
export type LangId = (typeof LANGS)[number]["id"];

export function CodeEditor({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: LangId }) {
  const lines = value.split("\n").length;
  return (
    <div className="flex min-w-0 max-w-full overflow-auto rounded-lg border border-primary/25 bg-background/80 font-mono text-[13px]" style={{ maxHeight: "55dvh" }}>
      <div className="shrink-0 select-none border-r border-primary/15 px-2 py-2.5 text-right text-muted-foreground/60" aria-hidden>
        {Array.from({ length: lines }, (_, i) => <div key={i} style={{ lineHeight: "1.5" }}>{i + 1}</div>)}
      </div>
      <Editor value={value} onValueChange={onChange} padding={10} className="code-editor min-w-0 flex-1"
        style={{ lineHeight: "1.5", minHeight: 260 }}
        highlight={(c) => Prism.highlight(c, Prism.languages[lang] ?? Prism.languages["clike"]!, lang)} />
    </div>
  );
}
