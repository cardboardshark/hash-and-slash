import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Shape } from "@/core/primitives/shape";
import { Texture } from "@/core/shaders/texture";
import { PointLike } from "@/core/types/primitive-types";

export class Rectangle extends Shape {
    width;
    height;
    fill = "r";

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
        const fillValue = this.fill !== null ? String(this.fill).substring(0, 1) : null;
        let localBuffer = new DrawBuffer().fillRectangle(new Rectangle(Point.ZeroZero, this.width, this.height), fillValue);
        localBuffer = Texture.applyFromOptions(localBuffer, this.texture);
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
