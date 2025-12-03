import { SpriteFactory } from "@/core/sprite-factory";
import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { isSpriteLike, type Renderable, type SpriteLike } from "@/core/types";

type CanvasConfig = {
    width: number;
    height: number;
    element: HTMLElement | null;
    fill?: string;
};
export class Canvas {
    #config;
    debugMode = true;

    constructor(config: CanvasConfig) {
        this.#config = config;
    }

    get width() {
        return this.#config.width;
    }

    get height() {
        return this.#config.height;
    }

    #hydrateBuffer(buffer: Renderable | Renderable[] | Set<unknown> | Set<unknown>[]): SpriteLike[] {
        if (Array.isArray(buffer)) {
            return buffer.reduce<SpriteLike[]>((acc, item) => {
                const product = this.#hydrateBuffer(item);
                if (Array.isArray(product)) {
                    acc.push(...product);
                } else {
                    acc.push(product);
                }
                return acc;
            }, []);
        }

        if (buffer instanceof Set) {
            const setItems = Array.from(buffer) as Renderable[];
            return this.#hydrateBuffer(setItems);
        }

        const sprites: SpriteLike[] = [];
        if (isSpriteLike(buffer)) {
            sprites.push(buffer);
        } else {
            const product = SpriteFactory.make(buffer);
            if (Array.isArray(product)) {
                sprites.push(...product);
            } else {
                sprites.push(product);
            }
        }

        return sprites;
    }

    draw(buffer: Renderable | Renderable[] | Set<unknown> | Set<unknown>[]) {
        let pixels = Array.from({ length: this.#config.height })
            .fill(null)
            .map(() => Array.from({ length: this.#config.width }).fill(this.#config.fill ?? " "));

        let sprites = this.#hydrateBuffer(buffer);

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

        if (this.debugMode) {
            const firstRow = Array.from({ length: this.#config.width }).fill(null);

            // prepend y-axis ruler
            pixels = pixels.map((column, index) => {
                return [`${String(index).padStart(2, " ")}→`, ...column];
            });

            pixels.unshift(["   ", ...firstRow.map(() => "↓")]);
            pixels.unshift(["   ", ...firstRow.map((_value, index) => index % 10)]);
            pixels.unshift([
                "   ",
                ...firstRow.map((_value, index) => {
                    const firstDigit = Math.floor(index / 10);
                    if (firstDigit === 0) {
                        return " ";
                    }
                    return firstDigit;
                }),
            ]);
        }

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
