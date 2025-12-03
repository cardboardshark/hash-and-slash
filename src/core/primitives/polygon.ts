import { type PolygonLike, type PointLike, isPolygonLike, type BoundingBox } from "@/core/types";
import { Line } from "./line";
import { calculateBoundingBox } from "@/core/utils/math-utils";
import { Shape } from "@/core/primitives/shape";
import { Point } from "@/core/primitives/point";

export class Polygon extends Shape implements PolygonLike {
    points: PointLike[];
    lines: Line[];
    closed: true = true;
    boundingBox: BoundingBox;

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
        this.boundingBox = Polygon.calculateBoundingBox(this);
    }

    #calculateLines() {
        this.lines = [];

        const isClosed = new Point(this.points[0]).equals(this.points[this.points.length - 1]);

        const composedPoints = isClosed ? this.points : [...this.points, this.points[0]];
        for (let i = 0; i <= composedPoints.length; i += 1) {
            const nextPoint = composedPoints.at(i + 1);
            if (nextPoint) {
                this.lines.push(new Line(composedPoints[i], nextPoint));
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
