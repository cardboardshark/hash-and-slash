import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Line } from "@/core/primitives/line";
import { Shape } from "@/core/primitives/shape";
import { PointLike } from "@/core/types/primitive-types";

export class Rectangle extends Shape {
    x;
    y;
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
            new Line(this.point, this.point.add({ x: this.width, y: 0 })),
            // right
            new Line(this.point.add({ x: this.width, y: 0 }), this.point.add({ x: this.width, y: this.height })),
            // bottom
            new Line(this.point.add({ x: 0, y: this.height }), this.point.add({ x: this.width, y: this.height })),
            // left
            new Line(this.point, this.point.add({ x: 0, y: this.height })),
        ];
    }

    toPixels() {
        return new PixelGrid().fill(this.boundingBox.width, this.boundingBox.height, String(this.fill).substring(0, 1));
    }

    get boundingBox() {
        return {
            left: this.point.x,
            right: this.point.x + this.width,
            bottom: this.point.y + this.height,
            top: this.point.y,
            width: this.width,
            height: this.height,
        };
    }
}
