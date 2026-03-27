import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },

    build: {
        // Ensure assets are output to the correct Laravel folder
        outDir: 'public/build',
        manifest: true,           // Important for Laravel
        rollupOptions: {
            output: {
                // Helps with consistent chunk naming
                manualChunks: undefined,
            },
        },
    },

    server: {
        port: 3000,
        host: true,

        hmr: {
            host: '127.0.0.1',
        },

        headers: {
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://*.paystack.co https://checkout.paystack.com",
                "connect-src 'self' https://*.paystack.co https://*.paystack.com api.paystack.co ws://127.0.0.1:*",
                "img-src 'self' data: blob: https://*.paystack.co https://*.paystack.com",
                "style-src 'self' 'unsafe-inline'",
                "font-src 'self' data:",
                "frame-src 'self' https://checkout.paystack.com https://*.paystack.com",
                "worker-src 'self' blob:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
            ].join('; '),
        },

        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/sanctum/csrf-cookie': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/broadcasting/auth': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});