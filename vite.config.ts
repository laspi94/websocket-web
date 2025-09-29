import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite';

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [react()],
    server: {
      port: Number(process.env.VITE_APP_PORT) || 5173,
    },
  });
}
