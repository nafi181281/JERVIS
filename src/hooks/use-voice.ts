import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { beep } from "@/lib/sfx";

export type Lang = "bn" | "en";
export type VoiceChoice = Pick<SpeechSynthesisVoice, "name" | "lang" | "voiceURI"> & { localService?: boolean; default?: boolean };
const LOCALE: Record<Lang, string> = { bn: "bn-BD", en: "en-US" };

/** Clean markdown and syntax for natural, fluent spoken output. */
export function cleanForSpeech(md: string) {
  const isBn = /[\u0980-\u09FF]/.test(md);
  return md
    .replace(/---\s*>\s*💡[\s\S]*$/gi, "")
    .replace(/```[\s\S]*?```/g, isBn ? " কোডটি স্ক্রিনে বিস্তারিত দেওয়া হয়েছে। " : " The code is shown on screen. ")
    .replace(/(?:^|\n)(?:[ \t]*\|[^\n]+\|[ \t]*\r?\n?)+/g, isBn ? " বিস্তারিত ছকটি স্ক্রিনে প্রদর্শিত হয়েছে। " : " The structured table is shown on screen. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[#*_>|~]/g, " ")
    .replace(/--+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split at sentence and clause boundaries so speech engines do not rush long answers. */
export function chunkForSpeech(text: string, maxLength = 220) {
  const sentences = cleanForSpeech(text).match(/[^.!?।]+[.!?।]?/g) ?? [];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    for (const word of words) {
      if (!word) continue;
      if (current && `${current} ${word}`.length > maxLength) {
        chunks.push(current);
        current = word;
      } else current = current ? `${current} ${word}` : word;
    }
    if (current && /[.!?।]$/.test(current)) {
      chunks.push(current);
      current = "";
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Prefer a requested voice, then clear natural/neural voices in the answer's language. */
export function pickVoice<T extends VoiceChoice>(voices: T[], lang: Lang, preferredURI = ""): T | undefined {
  const base = LOCALE[lang].slice(0, 2).toLowerCase();
  const matching = voices.filter((voice) => voice.lang.toLowerCase().startsWith(base));
  const preferred = matching.find((voice) => voice.voiceURI === preferredURI);
  if (preferred) return preferred;
  const scored = matching.map((voice) => {
    const name = voice.name.toLowerCase();
    const locale = voice.lang.toLowerCase();
    let score = 0;
    if (/natural|neural|online/.test(name)) score += 12;
    if (/google/.test(name)) score += 9;
    if (/microsoft/.test(name)) score += 5;
    if (/premium|enhanced/.test(name)) score += 7;
    if (lang === "en" && locale.startsWith("en-gb")) score += 4;
    if (/daniel|arthur|ryan|thomas|guy|george|male/.test(name)) score += 2;
    if (/compact|espeak|novelty|whisper|zarvox|trinoids/.test(name)) score -= 12;
    if (voice.default) score += 1;
    if (voice.localService) score += 0.5;
    return { voice, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice;
}

/** Speech recognition, crystal-clear HD speech output and holographic core audio reactive level. */
export function useVoice(lang: Lang) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceId, setVoiceIdState] = useState("");
  const levelRef = useRef(0);
  const recRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const meterContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const selectedRef = useRef<Record<Lang, string>>({ en: "", bn: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tokenRef = useRef(0);
  const supported = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const primeSpeech = useCallback(() => {
    if (!audioRef.current && typeof Audio !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
      void audioRef.current.play().catch(() => {});
    }
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (synth) {
      try {
        synth.cancel();
        const unlock = new SpeechSynthesisUtterance("");
        unlock.volume = 0;
        synth.speak(unlock);
      } catch { /* ignore */ }
    }
  }, []);

  // Unlock browser audio immediately on first user interaction
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlockHandler = () => primeSpeech();
    window.addEventListener("pointerdown", unlockHandler, { once: true, passive: true });
    window.addEventListener("keydown", unlockHandler, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockHandler);
      window.removeEventListener("keydown", unlockHandler);
    };
  }, [primeSpeech]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jervis-speech-voices");
      if (saved) selectedRef.current = { ...selectedRef.current, ...JSON.parse(saved) };
    } catch { /* use automatic voice selection */ }
    setVoiceIdState(selectedRef.current[lang] || "");
  }, [lang]);

  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, []);

  const availableVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLowerCase().startsWith(lang)),
    [voices, lang],
  );

  const setVoiceId = useCallback((id: string) => {
    selectedRef.current[lang] = id;
    setVoiceIdState(id);
    try { localStorage.setItem("jervis-speech-voices", JSON.stringify(selectedRef.current)); } catch { /* optional preference */ }
  }, [lang]);

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void meterContextRef.current?.close();
    meterContextRef.current = null;
  }, []);

  const listen = useCallback(async (onFinal: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voice input isn't supported in this browser. Try Chrome.");
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    tokenRef.current++;
    setSpeaking(false);
    levelRef.current = 0;
    primeSpeech();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const context = new AudioContext();
      meterContextRef.current = context;
      await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        levelRef.current = data.reduce((a, b) => a + b, 0) / data.length / 140;
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* recognition can still work without the optional level meter */ }
    const rec = new SR();
    rec.lang = LOCALE[lang];
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (event: any) => {
      let temporary = "";
      for (const result of event.results) {
        if (result.isFinal) finalText = result[0].transcript;
        else temporary += result[0].transcript;
      }
      setInterim(finalText || temporary);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      stopMeter();
      levelRef.current = 0;
      beep("off");
      if (finalText.trim()) onFinal(finalText.trim());
    };
    rec.onerror = () => rec.stop();
    recRef.current = rec;
    rec.start();
    setListening(true);
    beep("on");
  }, [lang, primeSpeech, stopMeter]);

  const stopListening = useCallback(() => recRef.current?.stop(), []);

  const speakDevice = useCallback((text: string, answerLang: Lang) => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) { setSpeaking(false); return; }
    synth.cancel();
    const selected = pickVoice(voices, answerLang, selectedRef.current[answerLang]);
    const chunks = chunkForSpeech(text);
    if (!chunks.length) return;
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = selected?.lang || LOCALE[answerLang];
      if (selected) utterance.voice = selected;
      utterance.rate = 0.92;
      utterance.pitch = 0.96;
      utterance.volume = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onboundary = () => { levelRef.current = 0.48 + Math.random() * 0.38; };
      const finish = () => {
        if (index === chunks.length - 1) {
          setSpeaking(false);
          levelRef.current = 0;
        }
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      synth.speak(utterance);
    });
  }, [voices]);

  /** HD voice: server-rendered studio-clear speech, sentence by sentence, next clip prefetched. */
  const speakCloud = useCallback(async (text: string, answerLang: Lang) => {
    const token = ++tokenRef.current;
    const chunks = chunkForSpeech(text, 280);
    if (!chunks.length) return;

    const fetchClip = (chunk: string) => fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunk, lang: answerLang }),
    }).then(async (res) => {
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Voice unavailable");
      return URL.createObjectURL(await res.blob());
    });

    setSpeaking(true);
    levelRef.current = 0.4;
    let next = fetchClip(chunks[0]!);

    for (let i = 0; i < chunks.length; i++) {
      let url: string;
      try {
        url = await next;
      } catch {
        if (token === tokenRef.current) speakDevice(chunks.slice(i).join(" "), answerLang);
        return;
      }
      if (token !== tokenRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (i + 1 < chunks.length) next = fetchClip(chunks[i + 1]!);

      const audio = audioRef.current ?? (audioRef.current = new Audio());
      audio.src = url;
      try {
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("playback"));
          audio.onpause = () => { if (token !== tokenRef.current) resolve(); };
          audio.play().catch(reject);
        });
      } catch {
        URL.revokeObjectURL(url);
        if (token === tokenRef.current) speakDevice(chunks.slice(i).join(" "), answerLang);
        return;
      }
      URL.revokeObjectURL(url);
      if (token !== tokenRef.current) return;
    }

    if (token === tokenRef.current) {
      setSpeaking(false);
      levelRef.current = 0;
    }
  }, [speakDevice]);

  const speak = useCallback((text: string) => {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    tokenRef.current++;
    const answerLang: Lang = /[\u0980-\u09FF]/.test(text) ? "bn" : "en";
    if (!selectedRef.current[answerLang] && typeof fetch !== "undefined") {
      void speakCloud(text, answerLang);
    } else {
      speakDevice(text, answerLang);
    }
  }, [speakCloud, speakDevice]);

  const stopSpeaking = useCallback(() => {
    tokenRef.current++;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    levelRef.current = 0;
  }, []);

  useEffect(() => {
    if (!speaking) return;
    const id = window.setInterval(() => { levelRef.current = Math.max(0.22, levelRef.current * 0.88); }, 70);
    return () => window.clearInterval(id);
  }, [speaking]);

  useEffect(() => () => {
    stopMeter();
    tokenRef.current++;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
  }, [stopMeter]);

  return {
    unlock: primeSpeech,
    supported, listening, speaking, interim, levelRef, listen, stopListening, speak, stopSpeaking,
    voices, availableVoices, voiceId, setVoiceId,
  };
}

export type VoiceController = ReturnType<typeof useVoice>;
