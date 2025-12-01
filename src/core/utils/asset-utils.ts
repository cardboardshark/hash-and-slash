import { BLANK_CHARACTER } from "@/core/core-constants";

export function loadAsset(filename: string) {
    const importableAssets = import.meta.glob<string>("/public/*/*.txt", { eager: true, query: "?raw", import: "default" });
    const importKey = Object.keys(importableAssets).find((key) => key.endsWith(`${filename}.txt`));
    if (importKey) {
        return importableAssets[importKey].replaceAll(" ", BLANK_CHARACTER);
    }
}
