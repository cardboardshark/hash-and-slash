import { BLANK_CHARACTER } from "@/core/core-constants";
import { Point } from "@/core/geometry/point";
import { Rectangle } from "@/core/geometry/rectangle";
import { Node2d } from "@/core/primitives/node-2d";
import { RectangleShape } from "@/core/primitives/rectangle-shape";

export class PipeBox extends Node2d {
    fill = BLANK_CHARACTER;
    width;
    height;

    constructor(point: Point, width: number, height: number) {
        super();
        this.set(point);
        this.width = width;
        this.height = height;
    }

    get rectangle() {
        return new Rectangle(this.position, this.width, this.height);
    }

    draw() {
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

        const rect = new RectangleShape(this.position, this.width, this.height);
        rect.background = { src: content, fill: BLANK_CHARACTER };
        return rect.draw();
    }
}
