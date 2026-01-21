import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract the url parameter and convert to Google Forms path
          const match = path.match(/[?&]url=([^&]*)/);
          const formPath = match ? decodeURIComponent(match[1]) : '';
          return `/forms/${formPath}`;
        },
      },
    },
  },
})
