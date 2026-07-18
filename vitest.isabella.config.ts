import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/isabella/__tests__/**/*.test.ts'],
  },
});
