import { BLANK_CHARACTER } from "@/core/core-constants";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import type { PaintOptions, PointLike, Shape, TextLike } from "@/core/types";

interface TextOptions {
    align?: "left" | "center" | "right";
    width?: number;
    maxLines?: number;
    fill?: string;
}

export class Text implements Shape, TextLike {
    x;
    y;
    text;
    options;
    rectangle;

    constructor(point: PointLike, text: string | number, options: TextOptions = {}) {
        this.x = point.x;
        this.y = point.y;
        this.text = String(text);
        this.options = options;

        const splitText = this.text.split("\n");
        const longestRow = splitText.reduce((max, line) => {
            if (line.length > max) {
                max = line.length;
            }
            return max;
        }, 0);

        // useful for collission checks
        this.rectangle = new Rectangle(point, new Point(point).add(new Point(options.width ?? longestRow, options.maxLines ?? splitText.length)));
    }

    toPoints() {
        throw new Error("not yet implemented");
        return [];
    }

    toSprite() {
        const splitText = this.text.split("\n");
        const longestRow = splitText.reduce((max, line) => {
            if (line.length > max) {
                max = line.length;
            }
            return max;
        }, 0);

        const { width, align = "left", fill = BLANK_CHARACTER } = this.options;
        const numCharacters = width ?? longestRow;

        return splitText.map((line, index) => {
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

            let xPos = this.x;
            if (width === undefined && align !== undefined) {
                if (align === "right") {
                    xPos -= numCharacters;
                } else if (align === "center") {
                    xPos -= Math.floor(numCharacters / 2);
                }
            }

            return new Sprite(new Point(xPos, this.y + index), composedLine);
        });
    }
}
