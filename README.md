# AI Barber

AI Barber is a small demo app that analyzes a face photo and suggests haircut options using Gemini. The app generates a short biometric-style report and preview images for recommended hairstyles.

## Demo Video

<a href="https://youtube.com/shorts/2IANHwNtWwg" target="_blank" rel="noopener noreferrer">
  <img src="https://img.youtube.com/vi/2IANHwNtWwg/maxresdefault.jpg" alt="Watch the AI Barber demo on YouTube" width="720" />
</a>

[Watch the demo on YouTube Shorts](https://youtube.com/shorts/2IANHwNtWwg)

## Run Locally

Requirements:

- Node.js 18+
- Gemini API key

Steps:

1. Install dependencies:

```bash
npm install
```

2. Create a local env file and set your key:

```bash
cp .env.example .env.local
```

Then replace `MY_GEMINI_API_KEY` with your real key in `.env.local`.

3. Start the development server:

```bash
npm run dev
```

4. Open the app at:

`http://localhost:3000`
