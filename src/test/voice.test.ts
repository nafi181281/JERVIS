import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chunkForSpeech, cleanForSpeech, pickVoice, useVoice, type VoiceChoice } from "@/hooks/use-voice";

const voices: VoiceChoice[] = [
  { name: "English Compact", lang: "en-US", voiceURI: "compact" },
  { name: "Microsoft Daniel Natural", lang: "en-GB", voiceURI: "daniel" },
  { name: "Google US English", lang: "en-US", voiceURI: "google-us" },
  { name: "Google বাংলা", lang: "bn-BD", voiceURI: "google-bn" },
];

describe("JERVIS speech voice selection", () => {
  it("honors a manually selected voice in the answer language", () => {
    expect(pickVoice(voices, "en", "google-us")?.voiceURI).toBe("google-us");
  });

  it("falls back to a clear natural English voice", () => {
    expect(pickVoice(voices, "en")?.voiceURI).toBe("daniel");
  });

  it("does not select an English voice for Bengali speech", () => {
    expect(pickVoice(voices, "bn")?.voiceURI).toBe("google-bn");
  });

  it("returns no voice when the device has no matching language", () => {
    expect(pickVoice(voices.slice(0, 3), "bn")).toBeUndefined();
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("speech output settings", () => {
  it("uses the clearest voice with full volume and a measured speaking rate", async () => {
    const spoken: SpeechSynthesisUtterance[] = [];
    const synth = {
      getVoices: () => voices as SpeechSynthesisVoice[],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      cancel: vi.fn(),
      speak: (utterance: SpeechSynthesisUtterance) => spoken.push(utterance),
    };
    class MockUtterance {
      text: string;
      lang = "";
      voice: SpeechSynthesisVoice | null = null;
      rate = 1;
      pitch = 1;
      volume = 1;
      onstart = null;
      onboundary = null;
      onend = null;
      onerror = null;
      constructor(text: string) { this.text = text; }
    }
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    const { result, unmount } = renderHook(() => useVoice("en"));
    await waitFor(() => expect(result.current.availableVoices).toHaveLength(3));
    act(() => result.current.setVoiceId("daniel"));
    act(() => result.current.speak("Certainly, Sir. Shall we begin?"));
    expect(spoken).toHaveLength(2);
    expect(spoken[0]?.voice?.voiceURI).toBe("daniel");
    expect(spoken[0]?.rate).toBe(0.92);
    expect(spoken[0]?.volume).toBe(1);
    unmount();
  });
});

describe("speech preparation", () => {
  it("removes code and markdown before speech", () => {
    const cleaned = cleanForSpeech("**Answer**\n```js\nconsole.log('hidden')\n```\nUse `map()`.");
    expect(cleaned).not.toContain("console.log");
    expect(cleaned).not.toContain("**");
    expect(cleaned).toContain("Use map().");
  });

  it("keeps every speech chunk within the mobile pacing limit", () => {
    const chunks = chunkForSpeech(`${"A clear explanation with several words. ".repeat(20)}`, 120);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 120)).toBe(true);
  });
});

describe("HD voice", () => {
  it("asks the server for Bengali speech when the answer is in Bengali", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
    vi.stubGlobal("speechSynthesis", { getVoices: () => [], addEventListener: vi.fn(), removeEventListener: vi.fn(), cancel: vi.fn(), speak: vi.fn() });
    localStorage.removeItem("jervis-speech-voices");
    const { result, unmount } = renderHook(() => useVoice("bn"));
    act(() => result.current.speak("জি স্যার, আমি প্রস্তুত।"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/speech");
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1].body).lang).toBe("bn");
    unmount();
  });
});
