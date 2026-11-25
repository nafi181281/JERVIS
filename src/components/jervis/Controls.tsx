import { Volume2 } from "lucide-react";
import type { Lang, VoiceController } from "@/hooks/use-voice";
import { ApiKeyDialog } from "@/components/jervis/ApiKeyDialog";

export { ApiKeyDialog };

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-md border border-primary/30 p-0.5 text-xs" aria-label="Conversation language">
      {(["en", "bn"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-h-8 rounded px-3 py-1 font-display ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {l === "en" ? "EN" : "বাং"}
        </button>
      ))}
    </div>
  );
}

export function VoicePicker({ voice, className = "" }: { voice: VoiceController; className?: string }) {
  return (
    <label
      className={`flex min-w-0 items-center gap-2 rounded-lg border border-primary/20 bg-background/55 px-3 py-2 ${className}`}
    >
      <Volume2 size={15} className="shrink-0 text-primary" />
      <span className="shrink-0 font-display text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Voice</span>
      <select
        aria-label="Speech voice"
        value={voice.voiceId}
        onChange={(event) => voice.setVoiceId(event.target.value)}
        className="min-w-0 flex-1 truncate bg-transparent text-xs text-foreground outline-none"
      >
        <option value="">JERVIS HD voice (clearest)</option>
        {voice.availableVoices.map((item) => (
          <option key={item.voiceURI} value={item.voiceURI}>
            Device: {item.name} · {item.lang}
            {item.localService ? " · on device" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
