import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { type PointLike, type ShapeLike, type IntersectionResult, isPolygonLike, isRectangleLike } from "@/core/types";
import { getLineIntersection } from "@/core/utils/collision-util";

export class Ray {
    origin;
    vector;
    magnitude;
    line;

    constructor(origin: PointLike, vector: PointLike, magnitude: number) {
        this.origin = new Point(origin);
        this.vector = new Point(vector);
        this.magnitude = magnitude;
        this.line = new Line(origin, this.origin.project(vector, magnitude));
    }

    contains(point: PointLike) {
        const pointClass = new Point(point);
        return this.line.toPoints().some((p) => pointClass.equals(p));
    }

    getIntersection(shape: ShapeLike): IntersectionResult | false {
        if (isPolygonLike(shape)) {
            return shape.lines.reduce<IntersectionResult | false>((acc, l) => {
                if (acc) {
                    return acc;
                }
                const intersectionPoint = getLineIntersection(this.line, l);
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
                const intersectionPoint = getLineIntersection(this.line, l);
                if (intersectionPoint) {
                    acc = { point: new Point(intersectionPoint), line: new Line(l) };
                }
                return acc;
            }, false);
        }

        const intersectionPoint = getLineIntersection(this.line, shape);
        if (intersectionPoint) {
            return { point: new Point(intersectionPoint), line: new Line(shape) };
        }
        return false;
    }
}
