import { BLANK_CHARACTER } from "@/core/core-constants";
import type { LineLike, PointLike, PolygonLike, RectangleLike, TextLike } from "@/core/types";
import { calculateBoundingBox, calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";

export const Paint = {
    polygon(polygonLike: PolygonLike): string {
        const dimensions = calculateBoundingBox(polygonLike.points);
        const { fill = "s", stroke = "S" } = polygonLike;
        const grid = Array.from({ length: dimensions.height }, () => Array.from({ length: dimensions.width }, () => BLANK_CHARACTER));

        const polygon = polygonLike.points.map((p) => {
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

    rectangle(shape: RectangleLike): string {
        const { fill = "r", stroke } = shape;
        let output = "";
        for (let y = shape.topLeft.y; y < shape.bottomRight.y; y += 1) {
            let row = "";
            for (let x = shape.topLeft.x; x < shape.bottomRight.x; x += 1) {
                const isBorder = x === shape.topLeft.x || x === shape.bottomRight.x - 1 || y === shape.topLeft.y || y === shape.bottomRight.y - 1;
                if (isBorder) {
                    row += stroke ?? fill ?? " ";
                } else {
                    row += fill ?? " ";
                }
            }
            output += `${row}\n`;
        }
        return output;
    },

    line(line: LineLike) {
        const dimensions = calculateBoundingBox([line.start, line.end]);
        const { stroke = "l" } = line;
        const start = {
            x: line.start.x - dimensions.left,
            y: line.start.y - dimensions.top,
        };
        const end = {
            x: line.end.x - dimensions.left,
            y: line.end.y - dimensions.top,
        };

        if (dimensions.width === 0 && dimensions.height === 0) {
            console.log("Invalid line", line, dimensions);
            return "";
        }

        const grid = Array.from({ length: dimensions.height }, () => Array.from({ length: dimensions.width }, () => BLANK_CHARACTER));

        const diagonalDistance = calculateDiagonalDistance(start, end);
        for (let step = 0; step <= diagonalDistance; step++) {
            const t = diagonalDistance === 0 ? 0.0 : step / diagonalDistance;
            const { x, y } = lerpPoint(start, end, t);
            grid[y][x] = stroke;
        }
        return grid.map((row) => row.join("")).join("\n");
    },

    text(text: TextLike): string {
        const splitText = String(text.text).split("\n");
        const longestRow = splitText.reduce((max, line) => {
            if (line.length > max) {
                max = line.length;
            }
            return max;
        }, 0);

        const { width, align = "left", fill = BLANK_CHARACTER } = text.options ?? {};
        const numCharacters = width ?? longestRow;

        const output = splitText.map((line) => {
            let composedLine = line;
            if (line.length < numCharacters) {
                if (align === "left") {
                    composedLine = line.padEnd(numCharacters, fill);
                } else if (align === "center") {
                    const halfDiff = Math.floor((numCharacters - line.length) / 2);
                    composedLine = [new String().padStart(halfDiff, fill), line, new String().padEnd(halfDiff, fill)].join("");
                    if (composedLine.length !== numCharacters) {
                        composedLine.padEnd(numCharacters, fill);
                    }
                } else {
                    composedLine = line.padStart(numCharacters, fill);
                }
            }

            let xPos = text.x;
            if (width === undefined && align !== undefined) {
                if (align === "right") {
                    xPos -= numCharacters;
                } else if (align === "center") {
                    xPos -= Math.floor(numCharacters / 2);
                }
            }
            return composedLine;
        });
        return output.join("\n");
    },
};

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
