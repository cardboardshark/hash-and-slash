import { type PolygonLike, type PointLike, isPolygonLike, type BoundingBox, type PolyLineLike } from "@/core/types";
import { Line } from "./line";
import { calculateBoundingBox } from "@/core/utils/math-utils";
import { Shape } from "@/core/primitives/shape";

export class PolyLine extends Shape implements PolyLineLike {
    points: PointLike[];
    lines: Line[];
    closed: false = false;
    boundingBox;
    length;

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
        this.length = this.lines.reduce((sum, l) => sum + l.length, 0);
        this.boundingBox = PolyLine.calculateBoundingBox(this);
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
    }

    add(point: PointLike) {
        this.points.push(point);
        this.#calculateLines();
        this.length = this.lines.reduce((sum, l) => sum + l.length, 0);
        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    prepend(point: PointLike) {
        this.points.unshift(point);
        this.#calculateLines();
        this.length = this.lines.reduce((sum, l) => sum + l.length, 0);
        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    get last() {
        if (this.points.length === 0) {
            throw new Error("Polygon does not have any points.");
        }
        return this.points[this.points.length - 1];
    }

    static calculateBoundingBox(polyLine: PolyLineLike): BoundingBox {
        return calculateBoundingBox(polyLine.points);
    }
}
