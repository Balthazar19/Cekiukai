import { defineConfig } from "vite";

export default defineConfig({
  root: "public",
  build: {
    outDir: "../dist",
  },
  server: {
    open: "/login.html", 
    port: 5173, 
  }
});