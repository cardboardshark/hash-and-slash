import { BLANK_CHARACTER } from "@/core/core-constants";
import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Shape } from "@/core/primitives/shape";
import { PointLike, TextOptions, BoundingBox } from "@/core/types/primitive-types";

export class Text extends Shape {
    x;
    y;
    text;
    options;
    boundingBox;

    constructor(point: PointLike, text: string | number, options?: TextOptions) {
        super();

        this.x = point.x;
        this.y = point.y;
        this.text = text;
        this.options = options;

        this.boundingBox = Text.calculateBoundingBox(this);
    }

    toPixels() {
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

            let xPos = this.x;
            if (width === undefined && align !== undefined) {
                if (align === "right") {
                    xPos -= numCharacters;
                } else if (align === "center") {
                    xPos -= Math.floor(numCharacters / 2);
                }
            }
            return composedLine;
        });
        return PixelGrid.parse(output.join("\n"));
    }

    static calculateBoundingBox(text: Text): BoundingBox {
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
