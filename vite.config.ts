import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      base: '/ai-video-workflow-studio/',
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@douyinfe/semi-ui/dist/css/semi.css': path.resolve(__dirname, 'node_modules/@douyinfe/semi-ui/dist/css/semi.css'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.css']
      }
    };
});
