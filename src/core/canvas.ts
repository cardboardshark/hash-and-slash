import { App } from "@/core/app";
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

interface CanvasOptions {
    width: number;
    height: number;
    element: HTMLElement | null;
    fill?: string;
    debugMode?: boolean;
}
export class Canvas {
    debugMode = false;
    element: HTMLElement | null = null;
    width = 0;
    height = 0;

    static _key = Symbol("private key");

    constructor(options: CanvasOptions, key: Symbol) {
        this.width = options.width;
        this.height = options.height;
        this.element = options.element;
        this.debugMode = options.debugMode ?? false;

        if (key !== Canvas._key) {
            throw new Error("Canvas singleton must be initialized with Canvas.make()");
        }
    }

    static make(options: CanvasOptions) {
        const canvas = new Canvas(options, Canvas._key);
        // Set the active canvas to the App singleton
        App.canvas = canvas;
        return canvas;
    }

    #renderShape(shape: Shape) {
        const buffer = shape.toBuffer();
        if (shape.texture) {
            if (shape.texture instanceof Texture) {
                shape.texture.apply(buffer);
            }
            if (typeof shape.texture === "object") {
                new Texture(shape.texture).apply(buffer);
            }
            if (typeof shape.texture === "string") {
                new Texture({ src: shape.texture }).apply(buffer);
            }
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
                resultContainer.set(container.position);
                this.#recursiveDraw(resultContainer, screen, screenRect);
            } else {
                if (item instanceof Shape && isBoundingBoxWithinRectangle(item.boundingBox, screenRect)) {
                    screen.merge(this.#renderShape(item), {
                        offset: container.position.add(item.originPosition),
                        limit: screenRect,
                    });
                } else if (item instanceof Line || item instanceof PolyLine) {
                    screen.merge(item.toBuffer(), {
                        offset: container.position,
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
        const screenRect = new Rectangle(Point.ZeroZero, this.width, this.height);
        let screen = new Buffer();
        screen.fillRectangle(screenRect);

        if (this.debugMode) {
            const debugRect = new DebugRectangle(this.width, this.height);
            screen.merge(this.#renderShape(debugRect.toRenderable()), {
                offset: new Point(0, 0).subtract(debugRect.offset),
            });
        }

        this.#recursiveDraw(container, screen, screenRect);

        if (!this.element) {
            console.log(this.element);
            throw new Error("Unable to locate canvas element.");
        }
        this.element.style.setProperty("--width", String(this.width));
        this.element.style.setProperty("--height", String(this.height));

        const output = screen.toString();

        // skip writes if nothing changed
        if (this.element.innerHTML !== output) {
            this.element.innerHTML = output;
        }
    }
}
