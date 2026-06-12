import { defineConfig } from 'vite'; // บรรทัดนี้สำคัญมาก!
import react from '@vitejs/plugin-react';
import path from 'path';
// หลังจากนั้นค่อยเป็นส่วน export default
export default defineConfig(() => {
  return {
    base: '/Ecash/',
    // ... โค้ดส่วนที่เหลือ
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // ... โค้ดส่วนที่เหลือปล่อยไว้ตามเดิมครับ
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
