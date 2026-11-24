import { Link } from "@tanstack/react-router";
import { Code2, GraduationCap, MessageSquare, Mic, NotebookTabs } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Chat", icon: MessageSquare },
  { to: "/editor", label: "Code Lab", icon: Code2 },
  { to: "/viva", label: "Viva", icon: GraduationCap },
  { to: "/notes", label: "Notes", icon: NotebookTabs },
] as const;

type MicProps = { onMic?: () => void; micActive?: boolean; hideMobileHeader?: boolean };

export function Shell({ children, onMic, micActive, hideMobileHeader }: { children: ReactNode } & MicProps) {
  const item = (n: (typeof NAV)[number]) => {
    const Icon = n.icon;
    return (
      <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
        className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] text-muted-foreground transition-colors"
        activeProps={{ className: "text-primary" }}>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/25 bg-background/60"><Icon size={18} strokeWidth={1.6} /></span>
        <span className="truncate">{n.label}</span>
      </Link>
    );
  };
  return (
    <div className="hud-bg min-h-dvh text-foreground">
      <header className={`sticky top-0 z-30 border-b border-primary/20 bg-background/80 backdrop-blur-xl ${hideMobileHeader ? "hidden md:block" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
          <Link to="/" className="min-w-0" aria-label="JERVIS home">
            <div className="font-display text-lg font-bold tracking-[0.3em] text-primary glow-text sm:text-xl">JERVIS</div>
            <div className="text-[9px] tracking-[0.38em] text-muted-foreground sm:text-[10px]">AI FOR NAFI</div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-display text-[9px] tracking-[0.22em] text-muted-foreground sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" /> SYSTEM ONLINE
            </span>
            <nav className="hidden shrink-0 gap-1 text-xs md:flex lg:text-sm" aria-label="Main navigation">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                  className="rounded-md px-2.5 py-2 font-display uppercase tracking-wider text-muted-foreground transition hover:text-primary sm:px-3"
                  activeProps={{ className: "bg-primary/15 text-primary" }}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 pb-32 pt-3 sm:px-4 sm:pt-4 md:pb-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }} aria-label="Quick access">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end rounded-3xl border border-primary/30 bg-background/90 px-1.5 pb-1.5 pt-1 shadow-[0_-8px_40px_oklch(0_0_0_/_45%),0_0_24px_oklch(0.78_0.16_65_/_12%)] backdrop-blur-2xl">
          {item(NAV[0])}
          {item(NAV[1])}
          {onMic ? (
            <button type="button" onClick={onMic} aria-label={micActive ? "Stop listening" : "Tap to speak"}
              className="-mt-7 flex flex-col items-center gap-1 text-[10px] text-primary">
              <span className={`grid h-16 w-16 place-items-center rounded-full border-2 border-primary bg-background shadow-[0_0_28px_var(--primary)] ${micActive ? "animate-pulse bg-primary/25" : ""}`}><Mic size={26} /></span>
              {micActive ? "Listening" : "Tap to speak"}
            </button>
          ) : (
            <Link to="/" aria-label="Talk to JERVIS" className="-mt-7 flex flex-col items-center gap-1 text-[10px] text-primary">
              <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-primary bg-background shadow-[0_0_28px_var(--primary)]"><Mic size={26} /></span>
              Speak
            </Link>
          )}
          {item(NAV[2])}
          {item(NAV[3])}
        </div>
      </nav>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`hud-panel rounded-xl p-4 ${className}`}>
      {title && <h2 className="mb-3 font-display text-[10px] uppercase tracking-[0.28em] text-primary sm:text-xs sm:tracking-[0.3em]">{title}</h2>}
      {children}
    </section>
  );
}
