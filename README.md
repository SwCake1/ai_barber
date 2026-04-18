# AI Barber

AI Barber is a small demo app that analyzes a face photo and suggests haircut options using Gemini. The app generates a short biometric-style report and preview images for recommended hairstyles.

## Demo Video

Add your `.mp4` demo file here after recording:

`demo.mp4`

If you want the video to render on GitHub, place it in the repository and add a direct link to the file in this section.

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
