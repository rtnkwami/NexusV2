import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    exclude: [...defaultExclude, '**/dist/**'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.spec.ts'],
          sequence: {
            shuffle: {
              tests: true,
            },
            concurrent: true,
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['**/*.integration.spec.ts'],
          sequence: {
            shuffle: {
              tests: true,
            },
            concurrent: true,
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['**/*.e2e-spec.ts'],
          exclude: ['./test/openapi.e2e-spec.ts'],
          sequence: {
            shuffle: true,
          },
          maxWorkers: 1,
        },
      },
      {
        extends: true,
        test: {
          name: 'openapi',
          include: ['./test/openapi.e2e-spec.ts'],
        },
      },
    ],
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      src: resolve(__dirname, './src'),
      test: resolve(__dirname, './test'),
    },
  },
});
