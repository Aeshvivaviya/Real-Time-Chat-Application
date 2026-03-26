import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    // basicSsl only for local dev, not production
    ...(process.env.NODE_ENV !== 'production' ? [basicSsl()] : []),
  ],
  server: {
    host: true,
    port: 5173,
  }
})
