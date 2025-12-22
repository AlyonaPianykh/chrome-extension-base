import {defineConfig, build} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import { writeFileSync, mkdirSync, copyFileSync, existsSync, readFileSync } from 'fs';

// Plugin to build file a standalone IIFE bundle
const buildIIFE = (fileName: string) => {
    const outputFileName = fileName.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '.js') || 'output.js';
    return {
        name: 'build-iife-bundle',
        async closeBundle() {
            console.log(`Building ${outputFileName} as standalone IIFE...`);
            await build({
                configFile: false,
                build: {
                    emptyOutDir: false,
                    lib: {
                        entry: resolve(__dirname, fileName),
                        name: 'IframeInjection',
                        formats: ['iife'],
                        fileName: () => outputFileName
                    },
                    outDir: 'dist',
                    rollupOptions: {
                        output: {
                            inlineDynamicImports: true
                        }
                    }
                }
            });
            console.log(`${outputFileName} built successfully`);
        }
    };
};

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
    plugins: [react(), copyStaticFiles(), buildIIFE('src/iframeContent.ts')],
    build: {
        rollupOptions: {
            input: {
                offscreen: resolve(__dirname, 'src/offscreen/offscreen.ts'),
                page: resolve(__dirname, 'src/pages/Page.tsx'),
                background: resolve(__dirname, 'src/background.ts')
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