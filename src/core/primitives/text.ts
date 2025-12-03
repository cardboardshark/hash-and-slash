import { isTextLike, type BoundingBox, type PointLike, type TextLike, type TextOptions } from "@/core/types";

export class Text implements TextLike {
    x;
    y;
    text;
    options;
    boundingBox;

    constructor(text: TextLike);
    constructor(point: PointLike, text: string | number, options?: TextOptions);
    constructor(pointOrText: PointLike | TextLike, text?: string | number, options?: TextOptions) {
        if (isTextLike(pointOrText)) {
            this.x = pointOrText.x;
            this.y = pointOrText.y;
            this.text = pointOrText.text;
            this.options = pointOrText.options;
        } else if (text !== undefined) {
            this.x = pointOrText.x;
            this.y = pointOrText.y;
            this.text = text;
            this.options = options;
        } else {
            throw new Error("Invalid arguments passed to Text");
        }

        this.boundingBox = Text.calculateBoundingBox(this);
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
