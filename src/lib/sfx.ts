let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}
export function beep(kind: "on" | "off" | "send" | "done" = "send") {
  const c = ac();
  if (!c) return;
  const seq: Record<string, number[]> = { on: [660, 990], off: [880, 440], send: [1200], done: [520, 780, 1040] };
  seq[kind]!.forEach((f, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.value = f;
    const t = c.currentTime + i * 0.07;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.14);
  });
}
