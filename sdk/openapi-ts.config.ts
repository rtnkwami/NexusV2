import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../api/openapi.yaml',
  output: 'src/client',
  client: '@hey-api/client-fetch',
  plugins: [
    '@hey-api/sdk',
    {
      name: '@hey-api/client-fetch',
      runtimeConfigPath: '../hey-api',
    },
  ],
});