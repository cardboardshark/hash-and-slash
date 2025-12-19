import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import type { PointLike } from "@/core/types/primitive-types";
import { calculateVectorBetweenPoints } from "@/core/utils/geometry-util";

export class Trail {
    points: Point[] = [];
    ownerPositionFn;
    maxLength;

    constructor(ownerPositionFn: () => Point, maxLength: number) {
        this.ownerPositionFn = ownerPositionFn;
        this.maxLength = maxLength;
    }

    add(point: PointLike) {
        this.points.unshift(new Point(point));
    }

    trim() {
        // const trimmedPoints = trimPointsToLength([this.ownerPositionFn(), ...this.points], this.maxLength);
        // trimmedPoints.splice(0, 1);
        // this.points = trimmedPoints;
        // console.log("length", calculateTotalDistanceBetweenPoints([this.ownerPositionFn(), ...this.points]), this.points);
    }

    get line() {
        return new PolyLine([this.ownerPositionFn(), ...this.points]);
    }

    get vector() {
        if (this.points.length === 0) {
            return Point.ZeroZero;
        }

        // const radian = calculateRadianBetweenPoints(this.points[0], this.ownerPositionFn());
        const vector = calculateVectorBetweenPoints(this.points[0], this.ownerPositionFn());
        // console.log([this.ownerPositionFn(), ...this.points], { radian, vector });
        return vector;
    }
}
