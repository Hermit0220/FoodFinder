import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lucide-react/icons': 'lucide-react/dist/esm/icons',
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
})
