import { BLANK_CHARACTER } from "@/core/core-constants";
import { Point } from "@/core/primitives/point";
import { Polygon } from "@/core/primitives/polygon";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import {
    isLineLike,
    isPolygonLike,
    isPolyLineLike,
    isRectangleLike,
    isTextLike,
    type LineLike,
    type PointLike,
    type PolygonLike,
    type RectangleLike,
    type ShapeLike,
    type TextLike,
} from "@/core/types";
import { calculateBoundingBox, calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";
import { fill } from "lodash";

export const SpriteFactory = {
    make(shape: ShapeLike) {
        if (isRectangleLike(shape)) {
            return new Sprite(shape.topLeft, this.makeRectangle(shape));
        }

        if (isPolygonLike(shape)) {
            const polygon = new Polygon(shape);
            const dimensions = calculateBoundingBox(polygon.points);
            const output = this.makePolygon(polygon);
            return new Sprite(new Point(dimensions.left, dimensions.top), output);
        }

        if (isPolyLineLike(shape)) {
            return shape.lines.map((l) => {
                const dimensions = calculateBoundingBox([l.start, l.end]);
                return new Sprite(new Point(dimensions.left, dimensions.top), this.makeLine(l));
            });
        }

        if (isLineLike(shape)) {
            const dimensions = calculateBoundingBox([shape.start, shape.end]);
            return new Sprite(new Point(dimensions.left, dimensions.top), this.makeLine(shape));
        }

        if (isTextLike(shape)) {
            const dimensions = Text.calculateBoundingBox(shape);
            return new Sprite(new Point(dimensions.left, dimensions.top), this.makeText(shape));
        }

        console.log(shape);
        throw new Error("Unknown shape received");
    },

    makePolygon(polygonLike: PolygonLike): string {
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

    makeRectangle(shape: RectangleLike): string {
        const { fill = "r", stroke } = shape;
        let output = "";
        for (let y = shape.topLeft.y; y <= shape.bottomRight.y; y += 1) {
            let row = "";
            for (let x = shape.topLeft.x; x <= shape.bottomRight.x; x += 1) {
                const isBorder = x === shape.topLeft.x || x === shape.bottomRight.x || y === shape.topLeft.y || y === shape.bottomRight.y;
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

    makeLine(line: LineLike) {
        const dimensions = calculateBoundingBox([line.start, line.end]);
        const { stroke = "l", fill = "L" } = line;
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

        const grid = Array.from({ length: dimensions.height + 1 }, () => Array.from({ length: dimensions.width + 1 }, () => BLANK_CHARACTER));

        const diagonalDistance = calculateDiagonalDistance(start, end);
        for (let step = 0; step <= diagonalDistance; step++) {
            const t = diagonalDistance === 0 ? 0.0 : step / diagonalDistance;
            const { x, y } = lerpPoint(start, end, t);
            const isPoint = (start.x === x && start.y === y) || (end.x === x && end.y === y);
            grid[y][x] = isPoint ? fill : stroke;
        }
        return grid.map((row) => row.join("")).join("\n");
    },

    makeText(text: TextLike): string {
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
                        composedLine = composedLine.padEnd(numCharacters, fill);
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
