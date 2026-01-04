import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { PointLike } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints } from "@/core/utils/geometry-util";

export class Polygon {
    points: PointLike[];
    closed: true = true;
    fill = "p";

    constructor(points: PointLike[]) {
        this.points = points;
    }

    get lines() {
        const lines = [];
        const isClosed = new Point(this.points[0]).equals(this.points[this.points.length - 1]);
        const composedPoints = isClosed ? this.points : [...this.points, this.points[0]];
        for (let i = 0; i <= composedPoints.length; i += 1) {
            const nextPoint = composedPoints.at(i + 1);
            if (nextPoint) {
                lines.push(new Line(composedPoints[i], nextPoint));
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

    add(point: PointLike) {
        this.points.push(point);
    }
}
