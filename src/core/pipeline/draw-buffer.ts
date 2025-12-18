import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { Pixel } from "@/core/types/canvas-types";
import { BoundingBox, IntersectingPixels, PointLike } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints, isPointInsideRectangle, rotateMatrix } from "@/core/utils/geometry-util";
import { sortBy } from "lodash";

interface MergeOptions {
    offset?: { x: number; y: number };
    lockTransparentPixels?: boolean;
    limit?: Rectangle;
}
interface IntersectArgument {
    buffer: DrawBuffer;
    offset: { x: number; y: number };
}

interface toStringOptions {
    fill?: string;
    crop?: {
        position: PointLike;
        width: number;
        height: number;
    };
}
export class DrawBuffer {
    pixelMap = new Map<string, Pixel>();
    hasChanged = true;
    #cachedBoundingBox: undefined | BoundingBox;

    constructor(initialPixels: Pixel[] = []) {
        initialPixels.forEach((p) => this.pixelMap.set(this.#flatKey(p), p));
    }

    #flatKey(point: { x: number; y: number }) {
        return `${point.x},${point.y}`;
    }

    fillRectangle(rect: Rectangle, value: string | number | null = null) {
        for (let y = rect.position.y; y < rect.height; y += 1) {
            for (let x = rect.position.x; x < rect.width; x += 1) {
                const point = { x, y, value };
                this.pixelMap.set(this.#flatKey(point), point);
            }
        }
        return this;
    }

    deleteRectangle(rect: Rectangle) {
        return this.fillRectangle(rect, null);
    }

    toString({ crop, fill = " " }: toStringOptions = {}) {
        let croppedPixels = Array.from(this.pixelMap.values());
        if (crop) {
            const cropRectangle = new Rectangle(crop.position, crop.width, crop.height);
            croppedPixels = croppedPixels.filter((pixel) => isPointInsideRectangle(pixel, cropRectangle));
        }

        // mergers may result in pixels being unsorted
        const sortedPixels = sortBy(croppedPixels, ["y", "x"]);

        let lastY: number | undefined;
        return sortedPixels.reduce((output, pixel) => {
            if (lastY === undefined) {
                lastY = pixel.y;
            }
            if (pixel.y !== lastY) {
                output += "\n";
                lastY = pixel.y;
            }
            if (pixel.value === null) {
                output += fill;
            } else {
                output += pixel.value;
            }

            return output;
        }, "");
    }

    merge(incomingBuffer: DrawBuffer, options: MergeOptions = {}) {
        incomingBuffer.pixelMap.forEach((p) => {
            if (p.value !== BLANK_CHARACTER && p.value !== null) {
                const composedPoint = options.offset
                    ? {
                          x: Math.round(p.x + options.offset.x),
                          y: Math.round(p.y + options.offset.y),
                      }
                    : p;
                const isInRange = options.limit === undefined || isPointInsideRectangle(composedPoint, options.limit);
                if (isInRange) {
                    const hasPixel = this.pixelMap.has(this.#flatKey(composedPoint));
                    const canUpdateOrInsertPixel = hasPixel || options.lockTransparentPixels !== true;
                    if (canUpdateOrInsertPixel) {
                        this.pixelMap.set(this.#flatKey(composedPoint), { x: composedPoint.x, y: composedPoint.y, value: p.value });
                    }
                }
            }
        });
        this.hasChanged = true;
        return this;
    }

    get boundingBox() {
        if (this.hasChanged || this.#cachedBoundingBox === undefined) {
            this.#cachedBoundingBox = calculateBoundingBoxFromPoints(Array.from(this.pixelMap.values()));
        }
        return this.#cachedBoundingBox;
    }

    rotate(degree: number) {
        const pixels = rotateMatrix(Array.from(this.pixelMap.values()), degree);
        return new DrawBuffer(pixels);
    }

    /** Return an array of overlapping pixels for both objects. */
    static intersect(bufferA: IntersectArgument, bufferB: IntersectArgument) {
        const bufferAPoints = Array.from(bufferA.buffer.pixelMap.values()).reduce<Record<string, IntersectingPixels>>((acc, p) => {
            const offsetPoint = bufferA.offset
                ? {
                      x: Math.round(p.x + bufferA.offset.x),
                      y: Math.round(p.y + bufferA.offset.y),
                      value: p.value,
                  }
                : p;

            acc[bufferA.buffer.#flatKey(offsetPoint)] = {
                source: p,
                offset: offsetPoint,
            };
            return acc;
        }, {});
        const bufferBPoints = Array.from(bufferB.buffer.pixelMap.values()).reduce<Record<string, IntersectingPixels>>((acc, p) => {
            const offsetPoint = bufferB.offset
                ? {
                      x: Math.round(p.x + bufferB.offset.x),
                      y: Math.round(p.y + bufferB.offset.y),
                      value: p.value,
                  }
                : p;

            acc[bufferB.buffer.#flatKey(offsetPoint)] = {
                source: p,
                offset: offsetPoint,
            };
            return acc;
        }, {});

        return Object.entries(bufferAPoints).reduce<IntersectingPixels[]>((acc, [key, intersection]) => {
            if (bufferBPoints[key] !== undefined && bufferBPoints[key].source.value !== null && bufferBPoints[key].source.value !== BLANK_CHARACTER) {
                acc.push(intersection);
            }
            return acc;
        }, []);
    }

    static parse(input: string) {
        const lines = input.split("\n");
        const pixels = lines.reduce<Pixel[]>((acc, line, lineIndex) => {
            const row = Array.from(line).map((value, characterIndex) => {
                return {
                    x: characterIndex,
                    y: lineIndex,
                    value,
                };
            });
            return acc.concat(row);
        }, []);

        return new DrawBuffer(pixels);
    }
}
