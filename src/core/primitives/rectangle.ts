import { isRectangleLike, type PaintOptions, type PointLike, type RectangleLike, type Shape, type SpriteLike } from "@/core/types";
import { Line } from "./line";
import { Sprite } from "./sprite";

export class Rectangle implements Shape, RectangleLike {
    topLeft;
    bottomRight;
    width;
    height;
    lines;

    constructor(p0: RectangleLike);
    constructor(p0: PointLike, p1: PointLike);
    constructor(p0OrRectangleLike: PointLike | RectangleLike, p1?: PointLike) {
        if (isRectangleLike(p0OrRectangleLike)) {
            this.topLeft = p0OrRectangleLike.topLeft;
            this.bottomRight = p0OrRectangleLike.bottomRight;
        } else if (p1 !== undefined) {
            this.topLeft = p0OrRectangleLike;
            this.bottomRight = p1;
        } else {
            throw new Error("Invalid arguments passed to Rectangle");
        }

        this.width = this.bottomRight.x - this.topLeft.x;
        this.height = this.bottomRight.y - this.topLeft.y;

        this.lines = [
            // top
            new Line(this.topLeft, { x: this.bottomRight.x, y: this.topLeft.y }),
            // right
            new Line({ x: this.bottomRight.x, y: this.topLeft.y }, this.bottomRight),
            // bottom
            new Line({ x: this.topLeft.x, y: this.bottomRight.y }, { x: this.bottomRight.x, y: this.bottomRight.y }),
            // left
            new Line(this.topLeft, { x: this.topLeft.x, y: this.bottomRight.y }),
        ];
    }

    contains(point: PointLike) {
        const isInXRange = point.x >= this.topLeft.x && point.x < this.bottomRight.x;
        const isInYRange = point.y >= this.topLeft.y && point.y < this.bottomRight.y;
        return isInXRange && isInYRange;
    }

    toPoints() {
        const points = [];
        for (let y = this.topLeft.y; y < this.bottomRight.y; y += 1) {
            for (let x = this.topLeft.x; x < this.bottomRight.x; x += 1) {
                points.push({ x, y });
            }
        }
        return points;
    }

    toSprite(options: PaintOptions = { fill: "r", stroke: "R" }) {
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
