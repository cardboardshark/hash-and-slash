import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import type { PointLike } from "@/core/types";
import { calculateVectorBetweenPoints } from "@/core/utils/geometry-util";

export class Trail {
    points: Point[] = [];
    ownerPositionFn;
    maxLength;

    constructor(ownerPositionFn: () => PointLike, maxLength: number) {
        this.ownerPositionFn = ownerPositionFn;
        this.maxLength = maxLength;
    }

    add(point: Point) {
        this.points.unshift(point);
    }

    get line() {
        return new PolyLine([this.ownerPositionFn(), ...this.points]).trim(this.maxLength);
    }

    get vector() {
        if (this.points.length === 0) {
            return Point.ZeroZero;
        }
        console.log(this.points, this.ownerPositionFn());
        return calculateVectorBetweenPoints(this.points[0], this.ownerPositionFn());
    }
}
