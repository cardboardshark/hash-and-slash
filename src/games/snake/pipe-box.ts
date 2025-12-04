import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import type { PointLike, RenderableEntity } from "@/core/types";

export class PipeBox implements RenderableEntity {
    rectangle: Rectangle;
    fill = BLANK_CHARACTER;

    constructor(topLeft: PointLike, bottomRight: PointLike) {
        this.rectangle = new Rectangle(topLeft, bottomRight);
    }
    toRenderable() {
        const dimensions = this.rectangle.boundingBox;
        let content = "";
        for (let y = 0; y < dimensions.height; y++) {
            for (let x = 0; x < dimensions.width; x++) {
                if (dimensions.left === x) {
                    if (dimensions.top === y) {
                        // top left
                        content += "╔";
                    } else if (dimensions.bottom === y) {
                        content += "╚";
                    } else {
                        content += "║";
                    }
                } else if (dimensions.right === x) {
                    if (dimensions.top === y) {
                        // top right
                        content += "╗";
                    } else if (dimensions.bottom === y) {
                        content += "╝";
                    } else {
                        content += "║";
                    }
                } else if (dimensions.top === y || dimensions.bottom === y) {
                    content += "═";
                } else {
                    content += this.fill;
                }
            }
            content += "\n";
        }
        return new Sprite(this.rectangle.topLeft, content);
    }
}
