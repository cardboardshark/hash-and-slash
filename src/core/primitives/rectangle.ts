import { isRectangleLike, type BoundingBox, type PointLike, type RectangleLike } from "@/core/types";
import { Line } from "./line";
import { Shape } from "@/core/primitives/shape";
import { calculateBoundingBox } from "@/core/utils/math-utils";

export class Rectangle extends Shape implements RectangleLike {
    topLeft;
    bottomRight;
    width;
    height;
    lines;

    constructor(p0: RectangleLike);
    constructor(p0: PointLike, p1: PointLike);
    constructor(p0OrRectangleLike: PointLike | RectangleLike, p1?: PointLike) {
        super();
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

    static calculateBoundingBox(rectangle: RectangleLike): BoundingBox {
        return calculateBoundingBox([rectangle.topLeft, rectangle.bottomRight]);
    }
}
