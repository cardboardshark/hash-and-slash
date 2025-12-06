import { type PolygonLike, type PointLike, isPolygonLike, type BoundingBox, type PolyLineLike } from "@/core/types";
import { Line } from "./line";
import { calculateBoundingBox } from "@/core/utils/math-utils";
import { Shape } from "@/core/primitives/shape";
import { Point } from "@/core/primitives/point";
import { convertRadianToVector, calculateVectorBetweenPoints, trimPointsToLength } from "@/core/utils/geometry-util";

export class PolyLine extends Shape implements PolyLineLike {
    points: Point[];
    lines: Line[] = [];
    closed: false = false;
    boundingBox;
    length = 0;

    constructor(shape: PolygonLike);
    constructor(points: PointLike[]);
    constructor(shapeOrPoints: PolygonLike | PointLike[] = []) {
        super();
        if (isPolygonLike(shapeOrPoints)) {
            this.points = shapeOrPoints.points.map((p) => new Point(p));
        } else {
            this.points = shapeOrPoints.map((p) => new Point(p));
        }

        this.#calculateLines();
        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    clone() {
        return new PolyLine(this.points);
    }

    add(point: PointLike) {
        this.points.push(new Point(point));
        this.#calculateLines();
        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    prepend(point: PointLike) {
        this.points.unshift(new Point(point));
        this.#calculateLines();
        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    set(index: number, point: PointLike) {
        this.points.splice(index, 1, new Point(point));
    }

    delete(index: number) {
        this.points.splice(index, 1);
    }

    trim(length: number) {
        this.points = trimPointsToLength(this.points, length);
        this.#calculateLines();
        this.boundingBox = PolyLine.calculateBoundingBox(this);

        return this;
    }

    get last() {
        if (this.points.length === 0) {
            throw new Error("Polygon does not have any points.");
        }
        return this.points[this.points.length - 1];
    }

    #calculateLines() {
        this.lines = [];
        for (let i = 0; i <= this.points.length; i += 1) {
            const nextPoint = this.points.at(i + 1);
            if (nextPoint) {
                const line = new Line(this.points[i], nextPoint);
                line.stroke = this.stroke;
                this.lines.push(line);
            }
        }
        this.length = this.lines.reduce((sum, l) => sum + l.length, 0);
    }

    static calculateBoundingBox(polyLine: PolyLineLike): BoundingBox {
        return calculateBoundingBox(polyLine.points);
    }
}
