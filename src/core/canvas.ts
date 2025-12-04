import { SpriteFactory } from "@/core/sprite-factory";
import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { isContainerLike, isRenderableEntity, isSpriteLike, type SpriteLike } from "@/core/types";
import { Container } from "@/core/primitives/container";
import { Sprite } from "@/core/primitives/sprite";

type CanvasConfig = {
    width: number;
    height: number;
    element: HTMLElement | null;
    fill?: string;
};
export class Canvas {
    #config;
    debugMode = false;

    constructor(config: CanvasConfig) {
        this.#config = config;
    }

    get width() {
        return this.#config.width;
    }

    get height() {
        return this.#config.height;
    }

    #hydrateBuffer(container: Container): SpriteLike[] {
        return container.children.reduce<SpriteLike[]>((sprites, item) => {
            if (isContainerLike(item)) {
                const childContainer = item instanceof Container ? item : new Container(item);
                return sprites.concat(this.#hydrateBuffer(childContainer));
            }

            if (isSpriteLike(item)) {
                const sprite = item instanceof Sprite ? item : new Sprite(item);

                // apply any offset values
                sprite.set(sprite.point.add(container.point));
                return [...sprites, sprite];
            }

            if (isRenderableEntity(item)) {
                const result = item.toRenderable();
                let childContainer: Container;
                if (isContainerLike(result)) {
                    childContainer = item instanceof Container ? item : new Container(result);
                } else {
                    const resultAsArray = Array.isArray(result) ? result : [result];
                    childContainer = new Container(resultAsArray);
                }
                childContainer.set(container.point);
                return sprites.concat(this.#hydrateBuffer(childContainer));
            }

            const result = SpriteFactory.make(item);
            if (Array.isArray(result)) {
                sprites.push(
                    ...result.map((sprite) => {
                        sprite.set(sprite.point.add(container.point));
                        return sprite;
                    })
                );
            } else {
                result.set(result.point.add(container.point));
                sprites.push(result);
            }

            return sprites;
        }, []);
    }

    draw(buffer: Container) {
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
                return [`${String(index).padStart(2, " ")}→`, ...column, `←${String(index).padEnd(2, " ")}`];
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
            pixels.push(["   ", ...firstRow.map(() => "↑")]);
            pixels.push([
                "   ",
                ...firstRow.map((_value, index) => {
                    const firstDigit = Math.floor(index / 10);
                    if (firstDigit === 0) {
                        return index % 10;
                    }
                    return firstDigit;
                }),
            ]);
            pixels.push([
                "   ",
                ...firstRow.map((_value, index) => {
                    const firstDigit = Math.floor(index / 10);
                    if (firstDigit === 0) {
                        return " ";
                    }
                    return index % 10;
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
