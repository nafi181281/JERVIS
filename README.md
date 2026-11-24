# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
cp .env.example .env   # add your free GEMINI_API_KEY
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploying on Vercel

1. Import the repository in Vercel (framework preset: **Other**; `vercel.json` sets the commands).
2. In **Settings → Environment Variables**, add `GEMINI_API_KEY` — a free key from https://aistudio.google.com/apikey, no credit card needed. AI chat (`/api/chat`) and the HD voice (`/api/speech`) both need it.
3. Deploy. The build detects Vercel and outputs `.vercel/output` with a Node 22 streaming function.
