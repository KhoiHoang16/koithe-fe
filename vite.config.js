import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_BACKEND_URL || 'http://localhost:8081',
                    changeOrigin: true,
                    secure: false,
                    // Giữ nguyên path /api khi forward đến backend
                    // VD: /api/products -> http://localhost:8080/api/products
                },
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: mode !== 'production',
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                                return 'react-vendor';
                            }
                            if (id.includes('@tanstack/react-query')) {
                                return 'query-vendor';
                            }
                            if (id.includes('lucide-react') || id.includes('sonner')) {
                                return 'ui-vendor';
                            }
                            if (id.includes('recharts')) {
                                return 'chart-vendor';
                            }
                        }
                    },
                },
            },
        },
    };
});
