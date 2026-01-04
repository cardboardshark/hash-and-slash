import { BLANK_CHARACTER } from "@/core/core-constants";
import { Point } from "@/core/geometry/point";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Node2d } from "@/core/primitives/node-2d";
import { PointLike, TextOptions } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints } from "@/core/utils/geometry-util";

export class Text extends Node2d {
    text;
    options;
    fill = BLANK_CHARACTER;

    constructor(point: PointLike, text: string | number, options?: TextOptions) {
        super();
        this.set(new Point(point.x, point.y));
        this.text = text;
        this.options = options;
    }

    draw() {
        const splitText = String(this.text).split("\n");
        const longestRow = splitText.reduce((max, line) => {
            if (line.length > max) {
                max = line.length;
            }
            return max;
        }, 0);

        const { width, align = "left", fill = BLANK_CHARACTER } = this.options ?? {};
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
            return composedLine;
        });

        return DrawBuffer.parse(output.join("\n"));
    }

    get dimensions() {
        const splitText = String(this.text).split("\n");
        const longestRow = splitText.reduce((max, line) => {
            if (line.length > max) {
                max = line.length;
            }
            return max;
        }, 0);

        const width = this.options?.width ?? longestRow;

        return { width, height: splitText.length };
    }

    get boundingBox() {
        const dimensions = this.dimensions;
        return {
            left: this.position.x,
            right: this.position.x + dimensions.width,
            top: this.position.y,
            bottom: this.position.y + dimensions.height,
            width: dimensions.width,
            height: dimensions.height,
        };
    }

    static fromPoints(point: PointLike, points: PointLike[], value: string | number = "X") {
        const dimensions = calculateBoundingBoxFromPoints(points);
        let content = "";
        for (let y = dimensions.top; y < dimensions.bottom; y += 1) {
            let characters = Array.from({ length: dimensions.width });
            for (let x = dimensions.left; x < dimensions.right; x += 1) {
                characters.splice(x, 1, value);
            }
            content += `${characters.join("")}\n`;
        }
        return new Text(point, content);
    }
}
