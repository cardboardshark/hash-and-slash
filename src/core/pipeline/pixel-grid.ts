import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { Pixel } from "@/core/types/canvas-types";
import { PointLike } from "@/core/types/primitive-types";
import { isPointInsideRectangle } from "@/core/utils/geometry-util";
import { range, sortBy } from "lodash";

interface toStringOptions {
    fill?: string;
    crop?: {
        point: PointLike;
        width: number;
        height: number;
    };
}
export class PixelGrid {
    pixels;

    constructor(pixels: Pixel[] = []) {
        this.pixels = pixels;
    }

    fill(width: number, height: number, value: string | number | null = null) {
        const numPixels = width * height;
        this.pixels = range(0, numPixels).map((_value, index) => {
            const x = index % width;
            const y = Math.floor(index / width);
            return { x, y, value };
        });
        return this;
    }

    toString({ crop, fill = " " }: toStringOptions = {}) {
        let croppedPixels = this.pixels;
        if (crop) {
            const cropRectangle = new Rectangle(crop.point, crop.width, crop.height);
            croppedPixels = this.pixels.filter((pixel) => isPointInsideRectangle(pixel, cropRectangle));
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

    merge(pixelsOrGrid: PixelGrid | Pixel[], point: PointLike) {
        const incomingPixels = pixelsOrGrid instanceof PixelGrid ? pixelsOrGrid.pixels : pixelsOrGrid;

        incomingPixels.forEach((p) => {
            if (p.value !== BLANK_CHARACTER) {
                const offsetP = {
                    x: p.x + point.x,
                    y: p.y + point.y,
                };
                const index = this.pixels.findIndex((p) => p.x === offsetP.x && p.y === offsetP.y);

                if (index === -1) {
                    this.pixels.push({ x: offsetP.x, y: offsetP.y, value: p.value });
                } else {
                    this.pixels[index].value = p.value;
                }
            }
        });

        return this;
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

        return new PixelGrid(pixels);
    }
}
