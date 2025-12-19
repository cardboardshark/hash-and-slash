import { BLANK_CHARACTER } from "@/core/core-constants";

export const AssetUtil = {
    load(filename: string) {
        const importableAssets = import.meta.glob<string>("/assets/**/*.txt", { eager: true, query: "?raw", import: "default" });
        const importKey = Object.keys(importableAssets).find((key) => key.endsWith(`${filename}.txt`));
        if (importKey && importableAssets[importKey] !== undefined) {
            return importableAssets[importKey].replaceAll(" ", BLANK_CHARACTER);
        }
        throw new Error(`Unable to load asset ${filename}`);
    },
};
