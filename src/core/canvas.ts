import { BLANK_CHARACTER } from "@/core/core-constants";
import { Paint } from "@/core/paint";
import type { CanvasBuffer } from "@/core/primitives/canvas-buffer";
import { Point } from "@/core/primitives/point";
import { Polygon } from "@/core/primitives/polygon";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { isLineLike, isPolygonLike, isRectangleLike, isSpriteLike, isTextLike, type SpriteLike } from "@/core/types";
import { calculateBoundingBox } from "@/core/utils/math-utils";

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

    #hydrateBuffer(buffer: CanvasBuffer): SpriteLike[] {
        return Array.from(buffer.items).reduce<SpriteLike[]>((acc, spriteOrShape) => {
            if (isSpriteLike(spriteOrShape)) {
                acc.push(spriteOrShape);
            } else if (isRectangleLike(spriteOrShape)) {
                acc.push(new Sprite(spriteOrShape.topLeft, Paint.rectangle(spriteOrShape)));
            } else if (isPolygonLike(spriteOrShape)) {
                const polygon = new Polygon(spriteOrShape);
                if (polygon.isClosed) {
                    const dimensions = calculateBoundingBox(polygon.points);
                    const output = Paint.polygon(polygon);
                    acc.push(new Sprite(new Point(dimensions.left, dimensions.top), output));
                } else {
                    const sprites = spriteOrShape.lines.map((l) => {
                        const dimensions = calculateBoundingBox([l.start, l.end]);
                        return new Sprite(new Point(dimensions.left, dimensions.top), Paint.line(l));
                    });
                    acc.push(...sprites);
                }
            } else if (isLineLike(spriteOrShape)) {
                const dimensions = calculateBoundingBox([spriteOrShape.start, spriteOrShape.end]);
                acc.push(new Sprite(new Point(dimensions.left, dimensions.top), Paint.line(spriteOrShape)));
            } else if (isTextLike(spriteOrShape)) {
                const dimensions = Text.calculateBoundingBox(spriteOrShape);
                acc.push(new Sprite(new Point(dimensions.left, dimensions.top), Paint.text(spriteOrShape)));
            } else {
                console.log(spriteOrShape, isRectangleLike(spriteOrShape));
                throw new Error("Unknown shape received");
            }
            return acc;
        }, []);
    }

    draw(buffer: CanvasBuffer) {
        const pixels = new Array(this.#config.height).fill(null).map(() => new Array(this.#config.width).fill(this.#config.fill ?? " "));

        const screenRect = new Rectangle({ x: 0, y: 0 }, { x: this.#config.width, y: this.#config.height });
        const sprites = this.#hydrateBuffer(buffer);
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
