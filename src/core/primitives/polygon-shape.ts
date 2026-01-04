import { BLANK_CHARACTER } from "@/core/core-constants";
import { Polygon } from "@/core/geometry/polygon";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Node2dGeometry } from "@/core/primitives/node-2d-geometry";
import { Pixel } from "@/core/types/canvas-types";
import { PointLike } from "@/core/types/primitive-types";

export class PolygonShape extends Node2dGeometry {
    shape: Polygon;

    fill = "p";

    constructor(points: PointLike[]) {
        super();
        this.shape = new Polygon(points);
    }

    draw() {
        // the polygon algorithm handles grids in a different format to a DrawBuffer.
        const multiDimensionalGrid = Array.from({ length: this.boundingBox.height }, () =>
            Array.from({ length: this.boundingBox.width }, () => BLANK_CHARACTER)
        );

        const polygon = this.shape.points.map((p) => {
            return {
                x: p.x,
                y: p.y,
            };
        });

        // Draw polygon stroke
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i];
            const b = polygon[(i + 1) % polygon.length];
            drawLine(multiDimensionalGrid, a, b, "P");
        }

        // Fill polygon interior using scanline fill + inside test
        for (let y = 0; y < this.boundingBox.height; y++) {
            for (let x = 0; x < this.boundingBox.width; x++) {
                if (multiDimensionalGrid[y][x] === BLANK_CHARACTER && isInside(polygon, x, y)) {
                    multiDimensionalGrid[y][x] = String(this.fill).substring(0, 1);
                }
            }
        }

        const pixels = multiDimensionalGrid.reduce<Pixel[]>((acc, column, columnIndex) => {
            const rowPixels = column.map((character, rowIndex) => {
                return {
                    x: rowIndex,
                    y: columnIndex,
                    value: character,
                };
            });
            return acc.concat(rowPixels);
        }, []);
        return new DrawBuffer(pixels);
    }

    static from(shape: Polygon) {
        return new PolygonShape(shape.points);
    }
}

// Draw a single pixel
function setPixel(grid: string[][], x: number, y: number, char: string) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x] = char;
    }
}

// Draw a line using Bresenham's algorithm
function drawLine(grid: string[][], a: PointLike, b: PointLike, char: string) {
    let x1 = a.x,
        y1 = a.y;
    const x2 = b.x,
        y2 = b.y;
    const dx = Math.abs(x2 - x1);
    const dy = -Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        setPixel(grid, x1, y1, char);
        if (x1 === x2 && y1 === y2) {
            break;
        }

        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x1 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y1 += sy;
        }
    }
}

// Ray-casting test for point inside polygon
function isInside(polygon: PointLike[], x: number, y: number): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x,
            yi = polygon[i].y;
        const xj = polygon[j].x,
            yj = polygon[j].y;

        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}
