import type { PaintOptions, PointLike, RectangleLike, SpriteLike } from "@/core/types";
import { Line } from "./line";
import { Sprite } from "./sprite";

export class Rectangle implements RectangleLike {
    topLeft;
    bottomRight;
    lines;

    constructor(p0: PointLike, p1: PointLike) {
        this.topLeft = p0;
        this.bottomRight = p1;
        this.lines = [
            // top
            new Line(p0, { x: p1.x, y: p0.y }),
            // right
            new Line({ x: p1.x, y: p0.y }, p1),
            // bottom
            new Line({ x: p0.x, y: p1.y }, { x: p1.x, y: p1.y }),
            // left
            new Line(p0, { x: p0.x, y: p1.y }),
        ];
    }

    contains(point: PointLike) {
        const isInXRange = point.x >= this.topLeft.x && point.x < this.bottomRight.x;
        const isInYRange = point.y >= this.topLeft.y && point.y < this.bottomRight.y;
        return isInXRange && isInYRange;
    }

    toSprite(options: PaintOptions): SpriteLike {
        let output = "";
        for (let y = this.topLeft.y; y < this.bottomRight.y; y += 1) {
            let row = "";
            for (let x = this.topLeft.x; x < this.bottomRight.x; x += 1) {
                const isBorder = x === this.topLeft.x || x === this.bottomRight.x - 1 || y === this.topLeft.y || y === this.bottomRight.y - 1;
                if (isBorder) {
                    row += options.stroke ?? options.fill ?? " ";
                } else {
                    row += options.fill ?? " ";
                }
            }
            output += `${row}\n`;
        }

        return new Sprite(this.topLeft, output);
    }
}
