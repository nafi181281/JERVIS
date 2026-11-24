import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createChatCall } from "@/lib/ai/responses";
import { systemFor, type JervisMode } from "@/lib/ai/prompts";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GEMINI_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        const body = (await request.json()) as { messages: UIMessage[]; mode?: JervisMode; lang?: "bn" | "en" };
        const messages = await convertToModelMessages(body.messages ?? []);
        return createChatCall(
          request,
          { apiKey, model: "gemini-3.8-flash" },
          messages,
          systemFor(body.mode ?? "tutor") + (body.lang === "bn" ? "\n\nThe user has chosen Bengali. Always reply in natural Bengali (বাংলা script), keeping code and technical terms in English." : ""),
        ).response();
      },
    },
  },
});
