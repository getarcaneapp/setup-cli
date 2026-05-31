import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
  },
})
