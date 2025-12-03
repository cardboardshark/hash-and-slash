import { isRectangleLike, type BoundingBox, type PointLike, type RectangleLike } from "@/core/types";
import { Line } from "./line";
import { Shape } from "@/core/primitives/shape";
import { calculateBoundingBox } from "@/core/utils/math-utils";
import { Point } from "@/core/primitives/point";

export class Rectangle extends Shape implements RectangleLike {
    topLeft;
    bottomRight;
    lines;
    boundingBox;

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

        this.boundingBox = Rectangle.calculateBoundingBox(this);

        this.lines = [
            // top
            new Line(new Point(this.boundingBox.left, this.boundingBox.top), new Point(this.boundingBox.right, this.boundingBox.top)),
            // right
            new Line(new Point(this.boundingBox.right, this.boundingBox.top), new Point(this.boundingBox.right, this.boundingBox.bottom)),
            // bottom
            new Line(new Point(this.boundingBox.left, this.boundingBox.bottom), new Point(this.boundingBox.right, this.boundingBox.bottom)),
            // left
            new Line(new Point(this.boundingBox.left, this.boundingBox.top), new Point(this.boundingBox.left, this.boundingBox.bottom)),
        ];
    }

    contains(point: PointLike) {
        const isInXRange = point.x >= this.topLeft.x && point.x <= this.bottomRight.x;
        const isInYRange = point.y >= this.topLeft.y && point.y <= this.bottomRight.y;
        return isInXRange && isInYRange;
    }

    static calculateBoundingBox(rectangle: RectangleLike): BoundingBox {
        return calculateBoundingBox([rectangle.topLeft, rectangle.bottomRight]);
    }
}
