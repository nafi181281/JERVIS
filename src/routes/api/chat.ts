import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createChatCall } from "@/lib/ai/responses";
import { systemFor, type JervisMode } from "@/lib/ai/prompts";
import { createFallbackChatResponse } from "@/lib/ai/fallback";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headerKey = request.headers.get("x-gemini-api-key");
        const body = (await request.json().catch(() => ({}))) as {
          messages?: UIMessage[];
          mode?: JervisMode;
          lang?: "bn" | "en";
          apiKey?: string;
        };
        const messages = await convertToModelMessages(body.messages ?? []);
        const mode = body.mode ?? "tutor";
        const lang = body.lang ?? "bn";

        // Prioritize: Header API Key -> Request Body API Key -> Server Environment Variable
        const clientKey = (headerKey && headerKey.trim()) || (body.apiKey && body.apiKey.trim());
        const serverKey = process.env["GEMINI_API_KEY"]?.trim();
        const activeKey = clientKey || serverKey;

        // When Gemini API key is not configured, seamlessly run in smart fallback mode without throwing 500 error
        if (!activeKey || activeKey === "AIzaSy...") {
          return createFallbackChatResponse(messages, mode, lang);
        }

        const model = process.env["GEMINI_MODEL"] || "gemini-2.0-flash";
        const systemPrompt =
          systemFor(mode) +
          (lang === "bn"
            ? "\n\nThe user has chosen Bengali. Always reply in natural, deep, articulate Bengali (বাংলা script), keeping code and technical terms in English."
            : "");

        try {
          return createChatCall(
            request,
            { apiKey: activeKey, model },
            messages,
            systemPrompt,
          ).response();
        } catch {
          return createFallbackChatResponse(messages, mode, lang);
        }
      },
    },
  },
});
