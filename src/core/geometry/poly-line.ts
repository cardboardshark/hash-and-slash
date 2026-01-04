import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { PointLike } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints, trimPointsToLength } from "@/core/utils/geometry-util";

export class PolyLine {
    points: Point[];
    closed: false = false;
    fill = "l";
    visible = true;

    constructor(points: PointLike[]) {
        this.points = points.map((p) => new Point(p));
    }

    clone() {
        return new PolyLine(this.points);
    }

    add(point: PointLike) {
        this.points.push(new Point(point));
    }

    prepend(point: PointLike) {
        this.points.unshift(new Point(point));
    }

    set(index: number, point: PointLike) {
        this.points.splice(index, 1, new Point(point));
    }

    delete(index: number) {
        this.points.splice(index, 1);
    }

    trim(length: number) {
        this.points = trimPointsToLength(this.points, length);
        return this;
    }

    get last() {
        if (this.points.length === 0) {
            throw new Error("Polyline does not have any points.");
        }
        return this.points[this.points.length - 1];
    }

    get lines() {
        let lines = [];
        for (let i = 0; i <= this.points.length; i += 1) {
            const nextPoint = this.points.at(i + 1);
            if (nextPoint) {
                const line = new Line(this.points[i], nextPoint);
                lines.push(line);
            }
        }
        return lines;
    }

    get dimensions() {
        const box = calculateBoundingBoxFromPoints(this.points);
        return { width: box.width, height: box.height };
    }

    get boundingBox() {
        return calculateBoundingBoxFromPoints(this.points);
    }

    get length() {
        return this.lines.reduce((sum, l) => sum + l.length, 0);
    }
}
