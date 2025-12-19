import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["./src/games/snake/main.ts"],
    dts: true,
    format: ["esm", "cjs"],
    minify: true,
});
