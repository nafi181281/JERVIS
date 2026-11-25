import { useEffect, useState } from "react";
import { KeyRound, Sparkles, ExternalLink, Check, Trash2, Eye, EyeOff, Cpu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ApiKeyDialog({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jervis_gemini_api_key") || "";
      setSavedKey(stored);
      setKey(stored);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      localStorage.removeItem("jervis_gemini_api_key");
      setSavedKey("");
      setKey("");
      toast.info("Gemini API Key মুছে ফেলা হয়েছে। JERVIS এখন বিল্ট-ইন ইঞ্জিনে কাজ করবে।");
      return;
    }
    localStorage.setItem("jervis_gemini_api_key", trimmed);
    setSavedKey(trimmed);
    toast.success("Gemini API Key সফলভাবে সংরক্ষিত হয়েছে! JERVIS এখন সম্পূর্ণ লাইভ মোডে সক্রিয়।");
    setOpen(false);
  };

  const handleClear = () => {
    localStorage.removeItem("jervis_gemini_api_key");
    setSavedKey("");
    setKey("");
    toast.info("API Key মুছে ফেলা হয়েছে।");
  };

  const isConnected = Boolean(savedKey && savedKey.trim().length > 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-display tracking-wider transition-colors ${
            isConnected
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-primary/40 bg-background/60 text-primary hover:bg-primary/10"
          } ${className}`}
          title={isConnected ? "Gemini Live AI সক্রিয়" : "এআই ইঞ্জিন কনফিগার করুন (Add Gemini Key)"}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase font-semibold">LIVE AI</span>
            </>
          ) : (
            <>
              <KeyRound size={13} className="text-primary/80" />
              <span className="text-[10px] tracking-[0.15em] uppercase">API KEY</span>
            </>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="border-primary/40 bg-background/95 p-5 backdrop-blur-xl sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-display text-sm tracking-[0.2em]">
            <Cpu size={18} /> JERVIS AI ENGINE CONFIGURATION
          </div>
          <DialogTitle className="text-base font-semibold text-foreground">
            Google Gemini লাইভ এআই ইন্টিগ্রেশন
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            যেকোনো প্রশ্নের (প্রোগ্রামিং, ডাটা স্ট্রাকচার, বিজ্ঞান, গণিত ও বাস্তব জীবন) আনলিমিটেড লাইভ ও গভীর উত্তরের জন্য আপনার Gemini API Key যুক্ত করুন।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-lg border border-primary/20 bg-background/60 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-display text-[10px] tracking-wider text-muted-foreground">
              <span>CURRENT STATUS</span>
              {isConnected ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={12} /> CONNECTED TO LIVE GEMINI
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles size={12} /> BUILT-IN SMART ENGINE
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/90">
              {isConnected
                ? "আপনার ব্রাউজারে লাইভ কি সক্রিয় আছে। যেকোনো প্রশ্নে সরাসরি ক্লাউড মডেল থেকে গভীর বিশ্লেষণ পাওয়া যাবে।"
                : "বর্তমানে বিল্ট-ইন ইঞ্জিন সক্রিয়। আরও শতভাগ নির্ভুল ও তাৎক্ষণিক উত্তরের জন্য ফ্রি কী যুক্ত করা সুপারিশকৃত।"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-display uppercase tracking-wider text-primary">
              Google Gemini API Key
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-xs font-mono pr-20 text-foreground outline-none focus:border-primary"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {savedKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-destructive/80 hover:text-destructive"
                    title="Remove key"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary/80 hover:text-primary hover:underline"
            >
              Get Free API Key (Google AI Studio) <ExternalLink size={11} />
            </a>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/20">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-primary/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save & Activate
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
