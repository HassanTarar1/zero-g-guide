import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so the built app works from any folder (GitHub Pages, Netlify, etc.)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
