import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createChatCall } from "@/lib/ai/responses";
import { systemFor, type JervisMode } from "@/lib/ai/prompts";
import { createFallbackChatResponse } from "@/lib/ai/fallback";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GEMINI_API_KEY"];
        const body = (await request.json()) as { messages: UIMessage[]; mode?: JervisMode; lang?: "bn" | "en" };
        const messages = await convertToModelMessages(body.messages ?? []);
        const mode = body.mode ?? "tutor";
        const lang = body.lang ?? "bn";

        // When Gemini API key is not configured, seamlessly run in smart fallback mode without throwing 500 error
        if (!apiKey || apiKey.trim() === "" || apiKey === "AIzaSy...") {
          return createFallbackChatResponse(messages, mode, lang);
        }

        const model = process.env["GEMINI_MODEL"] || "gemini-2.0-flash";
        const systemPrompt =
          systemFor(mode) +
          (lang === "bn"
            ? "\n\nThe user has chosen Bengali. Always reply in natural Bengali (বাংলা script), keeping code and technical terms in English."
            : "");

        try {
          return createChatCall(
            request,
            { apiKey, model },
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
