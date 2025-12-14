import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import type { RenderableEntity, PointLike } from "@/core/types/primitive-types";

export class PipeBox implements RenderableEntity {
    fill = BLANK_CHARACTER;
    position;
    width;
    height;

    constructor(point: PointLike, width: number, height: number) {
        this.position = point;
        this.width = width;
        this.height = height;
    }

    get rectangle() {
        return new Rectangle(this.position, this.width, this.height);
    }

    toRenderable() {
        const dimensions = {
            left: this.position.x,
            top: this.position.y,
            bottom: this.position.y + this.height,
            right: this.position.x + this.width,
        };
        let content = "";
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (dimensions.left === x) {
                    if (dimensions.top === y) {
                        // top left
                        content += "╔";
                    } else if (dimensions.bottom === y + 1) {
                        content += "╚";
                    } else {
                        content += "║";
                    }
                } else if (dimensions.right === x + 1) {
                    if (dimensions.top === y) {
                        // top right
                        content += "╗";
                    } else if (dimensions.bottom === y + 1) {
                        content += "╝";
                    } else {
                        content += "║";
                    }
                } else if (dimensions.top === y || dimensions.bottom === y + 1) {
                    content += "═";
                } else {
                    content += this.fill;
                }
            }
            content += "\n";
        }

        const rect = new Rectangle(this.position, this.width, this.height);
        rect.texture = { src: content, fill: BLANK_CHARACTER };
        return rect;
    }
}
