import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef } from "react";
import type { JervisMode } from "@/lib/ai/prompts";
import { beep } from "@/lib/sfx";

export function textOf(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

/** Chat with JERVIS in a given mode. `storageKey` keeps the conversation in this browser. */
export function useJervisChat(
  mode: JervisMode,
  opts: { storageKey?: string; onReply?: (text: string) => void; lang?: "bn" | "en" } = {},
) {
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const langRef = useRef(opts.lang);
  langRef.current = opts.lang;
  const onReply = useRef(opts.onReply);
  onReply.current = opts.onReply;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => {
          const clientKey = typeof window !== "undefined" ? localStorage.getItem("jervis_gemini_api_key") : null;
          return clientKey ? { "x-gemini-api-key": clientKey.trim() } : {};
        },
        body: () => {
          const clientKey = typeof window !== "undefined" ? localStorage.getItem("jervis_gemini_api_key") : null;
          return {
            mode: modeRef.current,
            lang: langRef.current,
            apiKey: clientKey?.trim() || undefined,
          };
        },
      }),
    [],
  );

  const chat = useChat({
    id: opts.storageKey ?? `jervis-${mode}`,
    transport,
    onFinish: ({ message }) => {
      beep("done");
      onReply.current?.(textOf(message));
    },
  });

  const loaded = useRef(false);
  useEffect(() => {
    if (!opts.storageKey || loaded.current) return;
    loaded.current = true;
    try {
      const saved = localStorage.getItem(opts.storageKey);
      if (saved) chat.setMessages(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, [opts.storageKey, chat]);

  useEffect(() => {
    if (opts.storageKey && loaded.current && chat.status === "ready") {
      localStorage.setItem(opts.storageKey, JSON.stringify(chat.messages));
    }
  }, [chat.messages, chat.status, opts.storageKey]);

  const ask = (text: string, m?: JervisMode) => {
    if (m) modeRef.current = m;
    beep("send");
    return chat.sendMessage({ text });
  };

  const busy = chat.status === "submitted" || chat.status === "streaming";
  return { ...chat, ask, busy };
}
