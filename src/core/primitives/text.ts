import { BLANK_CHARACTER } from "@/core/core-constants";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import type { BoundingBox, PointLike, TextLike, TextOptions } from "@/core/types";

export class Text implements TextLike {
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

    static calculateBoundingBox(text: TextLike): BoundingBox {
        const splitText = String(text.text).split("\n");
        const longestRow = splitText.reduce((max, line) => {
            if (line.length > max) {
                max = line.length;
            }
            return max;
        }, 0);

        const { width, align = "left" } = text.options ?? {};
        const numCharacters = width ?? longestRow;

        let xPos = text.x;
        if (width === undefined && align !== undefined) {
            if (align === "right") {
                xPos -= numCharacters;
            } else if (align === "center") {
                xPos -= Math.floor(numCharacters / 2);
            }
        }

        return {
            left: xPos,
            right: xPos + numCharacters,
            top: text.y,
            bottom: text.y + splitText.length,
            width: numCharacters,
            height: splitText.length,
        };
    }
}
