import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

/*
    Vite configuration for bundling assets
 */
export default defineConfig({
    // plugins: [checker({ typescript: true })],
    resolve: {
        alias: {
            "@/core/": "/src/core/",
            "@/games/": "/src/games/",
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
