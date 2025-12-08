import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PointLike } from "@/core/types/primitive-types";

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
}
