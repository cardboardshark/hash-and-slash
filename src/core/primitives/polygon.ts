import { type PolygonLike, type PointLike, type PaintOptions, isPolygonLike, type Shape } from "@/core/types";
import { Line } from "./line";
import { Sprite } from "./sprite";
import { Point } from "@/core/primitives/point";
import { Paint } from "@/core/paint";
import { calculateBoundingBox } from "@/core/utils/math-utils";

export class Polygon implements Shape, PolygonLike {
    points: PointLike[];
    lines: Line[];

    constructor(shape: PolygonLike);
    constructor(points: PointLike[]);
    constructor(shapeOrPoints: PolygonLike | PointLike[] = []) {
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

    strokeContains(point: PointLike) {
        return this.lines.some((l) => l.contains(point));
    }

    get last() {
        if (this.points.length === 0) {
            throw new Error("Polygon does not have any points.");
        }
        return this.points[this.points.length - 1];
    }

    toPoints() {
        return this.points;
    }

    toSprite(options: PaintOptions = { fill: "p", stroke: "P" }) {
        if (this.isClosed) {
            const dimensions = calculateBoundingBox(this.points);
            const output = Paint.polygon(this.points, {
                fill: options.fill ?? "p",
                stroke: options.stroke ?? "P",
            });
            return new Sprite(new Point(dimensions.left, dimensions.top), output);
        }
        return this.lines.flatMap((l) => l.toSprite(options));
    }
}
