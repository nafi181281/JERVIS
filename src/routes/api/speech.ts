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

/** Turns one short JERVIS sentence into a clear WAV clip (Bengali or English) via Gemini's TTS. */
export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GEMINI_API_KEY"];
        // When not configured, return 503 so client-side speech hook seamlessly falls back to device SpeechSynthesis
        if (!apiKey || apiKey.trim() === "" || apiKey === "AIzaSy...") {
          return Response.json({ error: "Voice key not configured; using device speech." }, { status: 503 });
        }
        const { text, lang } = (await request.json()) as { text?: string; lang?: string };
        const clean = (text ?? "").trim().slice(0, 600);
        if (!clean) return Response.json({ error: "Nothing to say." }, { status: 400 });
        const style = lang === "bn"
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
        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          let message = "Voice is unavailable right now.";
          try { message = JSON.parse(detail)?.error?.message || message; } catch { /* keep default */ }
          return Response.json({ error: message }, { status: upstream.status });
        }
        const data = (await upstream.json()) as {
          candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
        };
        const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
        const base64 = part?.inlineData?.data;
        if (!base64) return Response.json({ error: "Voice is unavailable right now." }, { status: 502 });
        const rateMatch = /rate=(\d+)/.exec(part?.inlineData?.mimeType ?? "");
        const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
        const wav = pcmToWav(Buffer.from(base64, "base64"), sampleRate);
        return new Response(new Uint8Array(wav), { headers: { "content-type": "audio/wav", "cache-control": "no-store" } });
      },
    },
  },
});
