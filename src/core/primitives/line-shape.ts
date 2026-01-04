import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Node2dGeometry } from "@/core/primitives/node-2d-geometry";
import { Pixel } from "@/core/types/canvas-types";
import { PointLike } from "@/core/types/primitive-types";
import { calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";

export class LineShape extends Node2dGeometry {
    shape;
    stroke = "l";

    constructor(p0: PointLike, p1: PointLike) {
        super();
        this.shape = new Line(p0, p1);
    }

    get originPosition() {
        // lines have no area, so origin position is always 0,0
        return new Point(Point.ZeroZero);
    }

    draw() {
        let pixels: Pixel[] = [];
        const diagonalDistance = calculateDiagonalDistance(this.shape.start, this.shape.end);
        for (let step = 0; step <= diagonalDistance; step++) {
            const t = diagonalDistance === 0 ? 0.0 : step / diagonalDistance;
            const { x, y } = lerpPoint(this.shape.start, this.shape.end, t);
            pixels.push({
                x,
                y,
                value: String(this.stroke).substring(0, 1),
            });
        }
        return new DrawBuffer(pixels);
    }

    static from(shape: Line) {
        return new Line(shape.start, shape.end);
    }
}
