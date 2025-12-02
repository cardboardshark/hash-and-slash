import { BLANK_CHARACTER } from "@/core/core-constants";
import type { BoundingBox, PointLike } from "@/core/types";
import { calculateBoundingBox } from "@/core/utils/math-utils";

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

interface PolygonPaintOptions {
    stroke: string;
    fill: string;
}
export const Paint = {
    polygon(points: PointLike[], { stroke, fill }: PolygonPaintOptions): string {
        const dimensions = calculateBoundingBox(points);
        console.log(dimensions);
        const grid = Array.from({ length: dimensions.height }, () => Array.from({ length: dimensions.width }, () => BLANK_CHARACTER));

        const polygon = points.map((p) => {
            return {
                x: p.x - dimensions.left,
                y: p.y - dimensions.top,
            };
        });
        // Draw polygon stroke
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i];
            const b = polygon[(i + 1) % polygon.length];
            drawLine(grid, a, b, stroke);
        }

        // Fill polygon interior using scanline fill + inside test
        for (let y = 0; y < dimensions.height; y++) {
            for (let x = 0; x < dimensions.width; x++) {
                if (grid[y][x] === BLANK_CHARACTER && isInside(polygon, x, y)) {
                    grid[y][x] = fill;
                }
            }
        }
        return grid.map((row) => row.join("")).join("\n");
    },
};
