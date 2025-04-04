import { fileURLToPath, URL } from 'node:url'
import sass from 'sass'
import eslintPlugin from 'vite-plugin-eslint'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({
      failOnError: false, // или true, чтобы сборка падала при ошибках
      failOnWarning: false,
    }),
  ],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        implementation: sass,
        additionalData: `
          @use '@/scss/abstracts/_mixins.scss' as *;
                      @use '@/scss/abstracts/_variables.scss' as *;
        `,
        sassOptions: {
          // Уровень предупреждений
          quietDeps: false,
          verbose: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Определение переменных окружения
  define: {
    'process.env': {},
  },
})
