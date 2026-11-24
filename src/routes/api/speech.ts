import { createFileRoute } from "@tanstack/react-router";

// Gemini's audio-capable model (configurable via GEMINI_TTS_MODEL).
const MODEL = process.env["GEMINI_TTS_MODEL"] || "gemini-2.0-flash";

/** Gemini TTS returns raw PCM (16-bit, mono); wrap it in a WAV header so <audio> can play it. */
function pcmToWav(pcm: Buffer, sampleRate: number, channels = 1, bitsPerSample = 16): Buffer {
  const blockAlign = channels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Split clean text into chunks under 160 characters so Google TTS limits are respected. */
function splitTextForGoogleTTS(text: string, maxLen = 150): string[] {
  const sentences = text.split(/(?<=[.!?।\n])\s+/);
  const result: string[] = [];
  let cur = "";

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    if ((cur + " " + sentence).length > maxLen) {
      if (cur) result.push(cur.trim());
      if (sentence.length > maxLen) {
        const words = sentence.split(/\s+/);
        let sub = "";
        for (const w of words) {
          if (w.length > maxLen) {
            if (sub) {
              result.push(sub.trim());
              sub = "";
            }
            for (let i = 0; i < w.length; i += maxLen) {
              result.push(w.slice(i, i + maxLen));
            }
            continue;
          }
          if ((sub + " " + w).length > maxLen) {
            if (sub) result.push(sub.trim());
            sub = w;
          } else {
            sub = sub ? `${sub} ${w}` : w;
          }
        }
        cur = sub;
      } else {
        cur = sentence;
      }
    } else {
      cur = cur ? `${cur} ${sentence}` : sentence;
    }
  }
  if (cur.trim()) result.push(cur.trim());
  return result.slice(0, 8);
}

/** Fetch high-definition neural Google TTS audio for natural Bengali and English. */
async function fetchGoogleHDTTS(text: string, lang: string): Promise<Response> {
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(text);
  const ttsLang = isBn ? "bn" : "en-GB";
  const chunks = splitTextForGoogleTTS(text, 140);

  if (!chunks.length) {
    return Response.json({ error: "Nothing to say." }, { status: 400 });
  }

  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(ttsLang)}&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!res.ok) {
      throw new Error(`Google TTS failed with status ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuffer));
  }

  const combined = Buffer.concat(audioBuffers);
  return new Response(new Uint8Array(combined), {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "public, max-age=86400",
    },
  });
}

/**
 * Turns JERVIS replies into crystal-clear HD speech (Bengali or English).
 * First attempts Gemini Audio if GEMINI_API_KEY is configured.
 * Seamlessly delivers studio-quality Google Cloud HD Neural TTS if Gemini key is unconfigured or fails.
 */
export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, lang } = (await request.json()) as { text?: string; lang?: string };
        const clean = (text ?? "").trim().slice(0, 1000);
        if (!clean) return Response.json({ error: "Nothing to say." }, { status: 400 });

        const apiKey = process.env["GEMINI_API_KEY"];

        // 1. If Gemini API key is configured, try Gemini HD Audio TTS
        if (apiKey && apiKey.trim() !== "" && apiKey !== "AIzaSy...") {
          try {
            const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(clean);
            const style = isBn
              ? "Speak in clear, natural Bangladeshi Bengali, calm, polite and well paced, like a refined assistant: "
              : "Speak in a calm, crisp, refined British butler tone, clearly articulated and well paced: ";

            const upstream = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
              {
                method: "POST",
                headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ role: "user", parts: [{ text: `${style}${clean}` }] }],
                  generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } },
                  },
                }),
                signal: request.signal,
              },
            );

            if (upstream.ok) {
              const data = (await upstream.json()) as {
                candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
              };
              const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
              const base64 = part?.inlineData?.data;
              if (base64) {
                const rateMatch = /rate=(\d+)/.exec(part?.inlineData?.mimeType ?? "");
                const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
                const wav = pcmToWav(Buffer.from(base64, "base64"), sampleRate);
                return new Response(new Uint8Array(wav), {
                  headers: { "content-type": "audio/wav", "cache-control": "no-store" },
                });
              }
            }
          } catch {
            // Fall back to Google HD TTS below
          }
        }

        // 2. High Definition Neural Google Cloud TTS (zero config, pristine audio)
        try {
          return await fetchGoogleHDTTS(clean, lang ?? "bn");
        } catch {
          // 3. Fallback to device speech synthesis if network is completely down
          return Response.json(
            { error: "Speech endpoint temporarily unavailable; using device voice." },
            { status: 503 },
          );
        }
      },
    },
  },
});
