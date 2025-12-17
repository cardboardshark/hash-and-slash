import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Shape } from "@/core/primitives/shape";
import { Background } from "@/core/shaders/background";
import { PointLike } from "@/core/types/primitive-types";

export class Rectangle extends Shape {
    width;
    height;

    constructor(point: PointLike, width: number, height: number) {
        super();

        this.set(new Point(point.x, point.y));
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

    draw() {
        let localBuffer = new DrawBuffer().fillRectangle(new Rectangle(Point.ZeroZero, this.width, this.height));
        localBuffer = Background.apply(localBuffer, this.background);
        return localBuffer;
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
