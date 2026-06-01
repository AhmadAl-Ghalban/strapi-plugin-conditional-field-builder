import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./admin/src/__tests__/setup.ts'],
    include: ['admin/src/**/*.test.{ts,tsx}'],
  },
});
