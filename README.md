# The Engineer's Sketchbook

A Ghibli-inspired portfolio, built with vanilla JavaScript, Vite, and GSAP.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build the Resume PDF**
   ```bash
   npm run build:resume
   ```
   This generates `public/resume.pdf` from `public/resume.tex` using `tectonic`.

4. **Build for Production**
   ```bash
   npm run build
   ```

## Assets

Place the following in `public/`:
- `resume.pdf`

## Architecture

- **Logic:** Vanilla JS (ES Modules) in `src/main.js` and `src/components/`.
- **Styling:** Tailwind CSS + `src/styles/main.css`.
- **Animation:** GSAP (Typewriter, ScrollTrigger) + Lenis (Smooth Scroll).
- **Data:** Static content in `src/data/`.
