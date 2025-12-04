import { defineConfig } from "vite";

/*
    Vite configuration for bundling assets
 */
export default defineConfig({
    resolve: {
        alias: {
            "@/core/": "/src/core/",
            "@/games/": "/src/games/",
        },
    },
});
