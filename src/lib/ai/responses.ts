import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";

/** Streams a chat reply from Google's Gemini API (genuinely free tier, no card needed). */
export function createChatCall(
  request: Request,
  config: { apiKey: string; model: string },
  messages: ModelMessage[],
  system?: string,
) {
  const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
  const result = streamText({
    model: google(config.model),
    ...(system ? { system } : {}),
    messages,
    abortSignal: request.signal,
  });
  return {
    result,
    response: () =>
      result.toUIMessageStreamResponse({
        onError: (error) => {
          const e = error as { statusCode?: number; responseBody?: string; message?: string };
          let message = e.message || "JERVIS could not answer right now.";
          try { const body = JSON.parse(e.responseBody ?? ""); message = body?.error?.message || body?.message || message; } catch { /* keep message */ }
          if (e.statusCode === 429) message = `Gemini's free-tier rate limit was hit, please wait a moment and try again. ${message}`;
          if (e.statusCode === 401 || e.statusCode === 403) message = `Gemini API key is invalid or missing. ${message}`;
          return message;
        },
      }),
  };
}
