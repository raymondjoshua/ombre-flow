import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // Add this temporary fix:
    {
      name: 'close-bundle',
      closeBundle: () => {
        process.exit(0);
      }
    }
  ],
})