import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Container } from "@/core/primitives/container";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Texture } from "@/core/shaders/texture";
import { isRenderableEntity } from "@/core/types/primitive-types";
import { isBoundingBoxWithinRectangle } from "@/core/utils/collision-util";

interface CanvasConfig {
    width: number;
    height: number;
    element: HTMLElement | null;
    fill?: string;
}
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

    #recursiveDraw(container: Container, screen: PixelGrid, screenRect: Rectangle): PixelGrid {
        container.children.forEach((item) => {
            if (item instanceof Container) {
                this.#recursiveDraw(item, screen, screenRect);
            } else if (isRenderableEntity(item)) {
                const result = item.toRenderable();
                let resultContainer: Container;
                if (result instanceof Container) {
                    resultContainer = result;
                } else {
                    resultContainer = new Container(Array.isArray(result) ? result : [result]);
                }
                this.#recursiveDraw(resultContainer, screen, screenRect);
            } else {
                if (isBoundingBoxWithinRectangle(item.boundingBox, screenRect)) {
                    // mutated by reference
                    const itemPixels = item.toPixels();

                    if (item.texture) {
                        let itemTexture;
                        if (item.texture instanceof Texture) {
                            itemTexture = item.texture;
                        }
                        if (typeof item.texture === "object") {
                            itemTexture = new Texture(item.texture);
                        }
                        if (typeof item.texture === "string") {
                            itemTexture = new Texture({ src: item.texture });
                        }
                        itemTexture?.apply(itemPixels);
                    }
                    for (let i = 0; i < item.shaders.length; i += 1) {
                        item.shaders[i].apply(itemPixels);
                    }
                    screen.merge(itemPixels, item.point.add(container.point));
                } else {
                    console.log("discarding", item);
                }
            }
        });
        return screen;
    }

    draw(buffer: Container) {
        let screen = new PixelGrid();
        screen.fill(this.#config.width, this.#config.height);

        const screenRect = new Rectangle({ x: 0, y: 0 }, this.#config.width, this.#config.height);

        this.#recursiveDraw(buffer, screen, screenRect);

        if (!this.#config.element) {
            throw new Error("Unable to locate canvas element.");
        }
        this.#config.element.style.setProperty("--width", String(this.#config.width));
        this.#config.element.style.setProperty("--height", String(this.#config.height));

        // if (this.debugMode) {
        //     const firstRow = Array.from({ length: this.#config.width }).fill(null);

        //     // prepend y-axis ruler
        //     pixels = pixels.map((column, index) => {
        //         return [`${String(index).padStart(2, " ")}→`, ...column, `←${String(index).padEnd(2, " ")}`];
        //     });

        //     pixels.unshift(["   ", ...firstRow.map(() => "↓")]);
        //     pixels.unshift(["   ", ...firstRow.map((_value, index) => index % 10)]);
        //     pixels.unshift([
        //         "   ",
        //         ...firstRow.map((_value, index) => {
        //             const firstDigit = Math.floor(index / 10);
        //             if (firstDigit === 0) {
        //                 return " ";
        //             }
        //             return firstDigit;
        //         }),
        //     ]);
        //     pixels.push(["   ", ...firstRow.map(() => "↑")]);
        //     pixels.push([
        //         "   ",
        //         ...firstRow.map((_value, index) => {
        //             const firstDigit = Math.floor(index / 10);
        //             if (firstDigit === 0) {
        //                 return index % 10;
        //             }
        //             return firstDigit;
        //         }),
        //     ]);
        //     pixels.push([
        //         "   ",
        //         ...firstRow.map((_value, index) => {
        //             const firstDigit = Math.floor(index / 10);
        //             if (firstDigit === 0) {
        //                 return " ";
        //             }
        //             return index % 10;
        //         }),
        //     ]);
        // }

        const output = screen.toString({
            crop: {
                point: Point.ZeroZero,
                width: this.#config.width,
                height: this.#config.height,
            },
        });

        // skip writes if nothing changed
        if (this.#config.element.innerHTML !== output) {
            this.#config.element.innerHTML = output;
        }
    }
}
