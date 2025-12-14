import { Buffer } from "@/core/pipeline/buffer";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Shape } from "@/core/primitives/shape";
import { PointLike } from "@/core/types/primitive-types";

export class Rectangle extends Shape {
    width;
    height;
    fill = "r";

    constructor(point: PointLike, width: number, height: number) {
        super();

        this.x = point.x;
        this.y = point.y;
        this.width = width;
        this.height = height;
    }

    get lines() {
        return [
            // top
            new Line(this.position, this.position.add({ x: this.width, y: 0 })),
            // right
            new Line(this.position.add({ x: this.width, y: 0 }), this.position.add({ x: this.width, y: this.height })),
            // bottom
            new Line(this.position.add({ x: 0, y: this.height }), this.position.add({ x: this.width, y: this.height })),
            // left
            new Line(this.position, this.position.add({ x: 0, y: this.height })),
        ];
    }

    toBuffer() {
        const fillValue = this.fill !== null ? String(this.fill).substring(0, 1) : null;
        return new Buffer().fillRectangle(new Rectangle(Point.ZeroZero, this.width, this.height), fillValue);
    }

    get boundingBox() {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            bottom: this.position.y + this.height,
            top: this.position.y,
            width: this.width,
            height: this.height,
        };
    }
}
