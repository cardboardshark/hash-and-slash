import { BLANK_CHARACTER } from "@/core/core-constants";
import { Buffer } from "@/core/pipeline/buffer";
import { DebugRectangle } from "@/core/pipeline/debug-rectangle";
import { Container } from "@/core/primitives/container";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Rectangle } from "@/core/primitives/rectangle";
import { Shape } from "@/core/primitives/shape";
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

    #renderShape(shape: Shape) {
        const buffer = shape.toBuffer();
        if (shape.texture) {
            let itemTexture;
            if (shape.texture instanceof Texture) {
                itemTexture = shape.texture;
            }
            if (typeof shape.texture === "object") {
                itemTexture = new Texture(shape.texture);
            }
            if (typeof shape.texture === "string") {
                itemTexture = new Texture({ src: shape.texture });
            }
            itemTexture?.apply(buffer);
        }
        for (let i = 0; i < shape.shaders.length; i += 1) {
            shape.shaders[i].apply(buffer);
        }
        return buffer;
    }

    #recursiveDraw(container: Container, screen: Buffer, screenRect: Rectangle) {
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
                resultContainer.set(container.point);
                this.#recursiveDraw(resultContainer, screen, screenRect);
            } else {
                if (item instanceof Shape && isBoundingBoxWithinRectangle(item.boundingBox, screenRect)) {
                    screen.merge(this.#renderShape(item), {
                        offset: container.point.add(item.originPoint),
                        limit: screenRect,
                    });
                } else if (item instanceof Line || item instanceof PolyLine) {
                    screen.merge(item.toBuffer(), {
                        offset: container.point,
                        limit: screenRect,
                    });
                } else {
                    console.log("out-of-bounds item culled from render", item);
                }
            }
        });
        return screen;
    }

    draw(container: Container) {
        const screenRect = new Rectangle(Point.ZeroZero, this.#config.width, this.#config.height);
        let screen = new Buffer();
        screen.fillRectangle(screenRect);

        if (this.debugMode) {
            const debugRect = new DebugRectangle(this.#config.width, this.#config.height);
            console.log(debugRect.toRenderable());
            screen.merge(this.#renderShape(debugRect.toRenderable()), {
                offset: new Point(0, 0).subtract(debugRect.offset),
            });
        }

        screen.deleteRectangle(screenRect);
        this.#recursiveDraw(container, screen, screenRect);

        if (!this.#config.element) {
            throw new Error("Unable to locate canvas element.");
        }
        this.#config.element.style.setProperty("--width", String(this.#config.width));
        this.#config.element.style.setProperty("--height", String(this.#config.height));

        const output = screen.toString();

        // skip writes if nothing changed
        if (this.#config.element.innerHTML !== output) {
            this.#config.element.innerHTML = output;
        }
    }
}
