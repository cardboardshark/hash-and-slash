import { Point } from "@/core/geometry/point";
import { PolyLine } from "@/core/geometry/poly-line";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Node2dGeometry } from "@/core/primitives/node-2d-geometry";
import { Pixel } from "@/core/types/canvas-types";
import { PointLike } from "@/core/types/primitive-types";
import { calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";

export class PolyLineShape extends Node2dGeometry {
    shape: PolyLine;
    closed: false = false;
    fill = "l";

    constructor(points: PointLike[]) {
        super();
        this.shape = new PolyLine(points);
    }

    get originPosition() {
        // polylines have no area, so origin position is always 0,0
        return new Point(Point.ZeroZero);
    }

    draw() {
        let pixels: Pixel[] = [];
        this.shape.lines.forEach((l) => {
            const diagonalDistance = calculateDiagonalDistance(l.start, l.end);
            for (let step = 0; step <= diagonalDistance; step++) {
                const t = diagonalDistance === 0 ? 0.0 : step / diagonalDistance;
                const { x, y } = lerpPoint(l.start, l.end, t);
                pixels.push({
                    x,
                    y,
                    value: String(this.fill).substring(0, 1),
                });
            }
        });

        return new DrawBuffer(pixels);
    }

    static from(shape: PolyLine) {
        return new PolyLineShape(shape.points);
    }
}
