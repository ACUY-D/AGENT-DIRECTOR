import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.ts',
        'tests/',
        'examples/',
        'docs/',
        'src/**/*.d.ts',
        'src/index.ts',
        'src/cli/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
    testTimeout: 30000,
    hookTimeout: 10000,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
      '@core': resolve(__dirname, './src/core'),
      '@roles': resolve(__dirname, './src/roles'),
      '@adapters': resolve(__dirname, './src/adapters'),
      '@tools': resolve(__dirname, './src/tools'),
      '@resources': resolve(__dirname, './src/resources'),
      '@prompts': resolve(__dirname, './src/prompts'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@cli': resolve(__dirname, './src/cli'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
      '@core': resolve(__dirname, './src/core'),
      '@roles': resolve(__dirname, './src/roles'),
      '@adapters': resolve(__dirname, './src/adapters'),
      '@tools': resolve(__dirname, './src/tools'),
      '@resources': resolve(__dirname, './src/resources'),
      '@prompts': resolve(__dirname, './src/prompts'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@cli': resolve(__dirname, './src/cli'),
    },
  },
});
