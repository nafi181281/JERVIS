<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- JERVIS AI calls go through one streaming server route (src/routes/api/chat.ts) with a `mode` that selects the system prompt in src/lib/ai/prompts.ts; calls Google's Gemini API directly with the free-tier `GEMINI_API_KEY` (model `gemini-3.8-flash`), not the Lovable AI gateway or any paid API.
- Voice uses browser speech recognition/synthesis (src/hooks/use-voice.ts) for zero-latency bilingual STT/TTS, plus an optional HD cloud voice (src/routes/api/speech.ts) that calls Gemini's native TTS (`gemini-3.8-flash-lite-tts`) directly with the same `GEMINI_API_KEY`, wrapping the raw PCM it returns into a WAV file.
- Builds use nitro preset `vercel` when `VERCEL` is set (vite.config.ts) so the same server routes run on Vercel; Lovable hosting keeps its enforced preset.
