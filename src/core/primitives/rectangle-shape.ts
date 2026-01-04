import { Point } from "@/core/geometry/point";
import { Rectangle } from "@/core/geometry/rectangle";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Node2dGeometry } from "@/core/primitives/node-2d-geometry";
import { Background } from "@/core/shaders/background";
import { PointLike, PointLikeFn } from "@/core/types/primitive-types";

export class RectangleShape extends Node2dGeometry {
    shape;

    constructor(point: PointLike | PointLikeFn, width: number, height: number) {
        super();

        this.set(point);
        this.shape = new Rectangle(() => this.position, width, height);
    }

    draw() {
        let localBuffer = new DrawBuffer().fillRectangle(new Rectangle(Point.ZeroZero, this.shape.width, this.shape.height));
        localBuffer = Background.apply(localBuffer, this.background);
        localBuffer.rotate(this.rotate);
        return localBuffer;
    }

    static from(rect: Rectangle) {
        return new RectangleShape(rect.pointReferenceFn ?? rect.position, rect.width, rect.height);
    }
}
