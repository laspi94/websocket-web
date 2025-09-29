import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite';

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [react()],
    base: process.env.VITE_APP_BASE_PATH || '/',
    server: {
      port: Number(process.env.VITE_APP_PORT) || 5173,
      hmr: {
        host: process.env.VITE_APP_HOST,
      },
    },
  });
}
