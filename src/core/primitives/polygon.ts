import { type PolygonLike, type PointLike, isPolygonLike, type BoundingBox } from "@/core/types";
import { Line } from "./line";
import { Point } from "@/core/primitives/point";
import { calculateBoundingBox } from "@/core/utils/math-utils";
import { Shape } from "@/core/primitives/shape";

export class Polygon extends Shape implements PolygonLike {
    points: PointLike[];
    lines: Line[];

    constructor(shape: PolygonLike);
    constructor(points: PointLike[]);
    constructor(shapeOrPoints: PolygonLike | PointLike[] = []) {
        super();
        if (isPolygonLike(shapeOrPoints)) {
            this.points = shapeOrPoints.points;
        } else {
            this.points = shapeOrPoints;
        }

        this.lines = [];
        this.#calculateLines();
    }

    get isClosed() {
        if (this.points.length <= 1) {
            return false;
        }
        const firstPoint = this.points.at(0);
        if (!firstPoint) {
            return false;
        }

        return new Point(firstPoint).equals(this.last);
    }

    #calculateLines() {
        this.lines = [];
        for (let i = 0; i <= this.points.length; i += 1) {
            const nextPoint = this.points.at(i + 1);
            if (nextPoint) {
                this.lines.push(new Line(this.points[i], nextPoint));
            }
        }
    }

    add(point: PointLike) {
        if (this.last) {
            this.lines.push(new Line(this.last, point));
        }
        this.points.push(point);
        this.#calculateLines();
    }

    get last() {
        if (this.points.length === 0) {
            throw new Error("Polygon does not have any points.");
        }
        return this.points[this.points.length - 1];
    }

    static calculateBoundingBox(polygon: PolygonLike): BoundingBox {
        return calculateBoundingBox(polygon.points);
    }
}
