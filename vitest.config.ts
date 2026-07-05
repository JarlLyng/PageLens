import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Standalone config so tests don't load the crxjs/react build plugins.
export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
