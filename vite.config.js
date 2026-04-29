import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const backendURL = env.VITE_BACKEND_URL || 'https://by8labs-backend.onrender.com';

    return {
        plugins: [react()],
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: backendURL,
                    changeOrigin: true
                }
            }
        }
    };
})
