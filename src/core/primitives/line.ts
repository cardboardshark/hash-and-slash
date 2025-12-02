import {
    type LineLike,
    type PointLike,
    isLineLike,
    type ShapeLike,
    isPolygonLike,
    isRectangleLike,
    type IntersectionResult,
    isPointLike,
    type BoundingBox,
} from "@/core/types";
import { getLineIntersection } from "../utils/collision-util";
import { Point } from "./point";
import { calculateBoundingBox, calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";
import { Shape } from "@/core/primitives/shape";

export class Line extends Shape implements LineLike {
    start;
    end;
    length;
    radian;

    constructor(p0: PointLike, p1: PointLike);
    constructor(line: LineLike);
    constructor(p0: PointLike | LineLike, p1?: PointLike) {
        super();
        if (isLineLike(p0)) {
            this.start = new Point(p0.start);
            this.end = new Point(p0.end);
        } else if (p1) {
            this.start = new Point(p0);
            this.end = new Point(p1);
        } else {
            throw new Error("Invalid arguments passed to Line.");
        }

        let dx = this.end.x - this.start.x,
            dy = this.end.y - this.start.y;
        this.length = Math.max(Math.abs(dx), Math.abs(dy));
        this.radian = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
    }

    intersects(shape: ShapeLike): boolean {
        return this.getIntersection(shape) !== false;
    }

    getIntersection(shape: ShapeLike | PointLike): IntersectionResult | false {
        if (isPolygonLike(shape)) {
            return shape.lines.reduce<IntersectionResult | false>((acc, l) => {
                if (acc) {
                    return acc;
                }
                const intersectionPoint = getLineIntersection(this, l);
                if (intersectionPoint) {
                    acc = { point: new Point(intersectionPoint), line: new Line(l) };
                }
                return acc;
            }, false);
        }
        if (isRectangleLike(shape)) {
            return shape.lines.reduce<IntersectionResult | false>((acc, l) => {
                if (acc) {
                    return acc;
                }
                const intersectionPoint = getLineIntersection(this, l);
                if (intersectionPoint) {
                    acc = { point: new Point(intersectionPoint), line: new Line(l) };
                }
                return acc;
            }, false);
        }
        if (isPointLike(shape)) {
            const point = new Point(shape);
            const hasIntersection = this.toPoints().some((p) => point.equals(p));
            return hasIntersection ? { point: point } : false;
        }

        const intersectionPoint = getLineIntersection(this, shape);
        if (intersectionPoint) {
            return { point: new Point(intersectionPoint), line: new Line(shape) };
        }
        return false;
    }

    toPoints() {
        const points: PointLike[] = [];
        const N = calculateDiagonalDistance(this.start, this.end);
        for (let step = 0; step <= N; step++) {
            let t = N === 0 ? 0.0 : step / N;
            points.push(lerpPoint(this.start, this.end, t));
        }
        return points;
    }

    rotate(radian: number) {
        const modulusedRadian = radian % (Math.PI * 2);
        const length = this.length;
        const resultAsRadian = this.radian + modulusedRadian;
        this.end = this.start.add(new Point({ x: Math.cos(resultAsRadian), y: Math.sin(resultAsRadian) }).multiplyScalar(length)).round();
    }

    getNormal() {
        // Direction vector of the line
        let dx = this.end.x - this.start.x;
        let dy = this.end.y - this.start.y;

        // Perpendicular vector (one of the two possible normals)
        let normalX = -dy;
        let normalY = dx;

        // Calculate magnitude to normalize
        let magnitude = Math.sqrt(normalX * normalX + normalY * normalY);

        // Handle the case of a zero-length line (points are identical)
        if (magnitude === 0) {
            return new Point(0, 0);
        }

        // Return the unit normal vector
        return new Point(normalX / magnitude, normalY / magnitude);
    }

    static calculateBoundingBox(line: LineLike): BoundingBox {
        return calculateBoundingBox([line.start, line.end]);
    }
}
