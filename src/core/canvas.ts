import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { SpriteCollection } from "@/core/primitives/sprite-collection";
import type { SpriteLike } from "@/core/types";

type CanvasConfig = {
    width: number;
    height: number;
    element: HTMLElement | null;
    fill?: string;
};
export class Canvas {
    #config;

    constructor(config: CanvasConfig) {
        this.#config = config;
    }

    get width() {
        return this.#config.width;
    }

    get height() {
        return this.#config.height;
    }

    draw(spritesOrSpriteCollection: SpriteLike[] | SpriteCollection) {
        const sprites = spritesOrSpriteCollection instanceof SpriteCollection ? spritesOrSpriteCollection.sprites : spritesOrSpriteCollection;

        const pixels = new Array(this.#config.height).fill(null).map(() => new Array(this.#config.width).fill(this.#config.fill ?? " "));

        const screenRect = new Rectangle({ x: 0, y: 0 }, { x: this.#config.width, y: this.#config.height });

        sprites.forEach((sprite) => {
            const spriteRows = typeof sprite.content === "string" ? sprite.content.split("\n") : [sprite.content];

            spriteRows.forEach((row, rowIndex) => {
                Array.from(String(row)).forEach((character, cellIndex) => {
                    const xPos = Math.round(sprite.x) + cellIndex;
                    const yPos = Math.round(sprite.y) + rowIndex;
                    const isNotBlank = character !== BLANK_CHARACTER;
                    if (isNotBlank && screenRect.contains({ x: xPos, y: yPos })) {
                        pixels[yPos][xPos] = character;
                    }
                });
            });
        });

        if (!this.#config.element) {
            throw new Error("Unable to locate canvas element.");
        }
        this.#config.element.style.setProperty("--width", String(this.#config.width));
        this.#config.element.style.setProperty("--height", String(this.#config.height));

        const output = pixels.reduce((acc, row) => {
            acc += `${row.join("")}\n`;
            return acc;
        }, "");

        // skip writes if nothing changed
        if (this.#config.element.innerHTML !== output) {
            this.#config.element.innerHTML = output;
        }
    }
}
