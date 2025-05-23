import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
      },
      headers: {
        "Permissions-Policy": "accelerometer=(), gyroscope=(), magnetometer=()",
      },
      allowedHosts: [
        "6e3b-2804-7f0-18-48bc-c008-f94d-3eca-98d2.ngrok-free.app",
      ],
    },
  };
});
