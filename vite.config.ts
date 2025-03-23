import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import { writeFileSync, mkdirSync, copyFileSync, existsSync, readFileSync } from 'fs';

const copyStaticFiles = () => {
    return {
        name: 'copy-static-files',
        // Use closeBundle instead of buildEnd for more reliability
        closeBundle() {
            console.log('Running copyStaticFiles plugin...');

            try {
                // Ensure dist directory exists
                mkdirSync('dist', { recursive: true });
                mkdirSync('dist/assets', { recursive: true });

                // Copy manifest.json
                if (existsSync('public/manifest.json')) {
                    console.log('Copying manifest.json');
                    copyFileSync('public/manifest.json', 'dist/manifest.json');
                } else {
                    console.warn('manifest.json not found');
                }

                // Copy HTML files with better error handling
                const htmlFiles = [
                    ['popup.html', 'dist/popup.html'],
                    ['offscreen.html', 'dist/offscreen.html'],
                    ['page.html', 'dist/page.html']
                ];

                htmlFiles.forEach(([src, dest]) => {
                    if (existsSync(src)) {
                        console.log(`Copying ${src} to ${dest}`);
                        copyFileSync(src, dest);
                    } else {
                        console.warn(`${src} not found`);
                    }
                });

                // Copy CSS file
                if (existsSync('src/assets/page.css')) {
                    console.log('Copying page.css');
                    copyFileSync('src/assets/page.css', 'dist/assets/page.css');
                } else {
                    console.warn('page.css not found');
                }
            } catch (err) {
                console.error('Error in copyStaticFiles plugin:', err);
            }
        }
    };
};

export default defineConfig({
    plugins: [react(), copyStaticFiles()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/Popup.tsx'),
                offscreen: resolve(__dirname, 'src/offscreen/Offscreen.tsx'),
                page: resolve(__dirname, 'src/pages/Page.tsx'),
                background: resolve(__dirname, 'src/background.ts'),
                content: resolve(__dirname, 'src/content.ts')
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[ext]',
                dir: 'dist'
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    css: {
        postcss: {}
    }
});