import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";

import { Pixel } from "@/core/types/canvas-types";
import { PointLike } from "@/core/types/primitive-types";

import { calculateBoundingBoxFromPoints, trimPointsToLength } from "@/core/utils/geometry-util";
import { calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";

export class PolyLine {
    points: Point[];
    closed: false = false;
    fill = "l";

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
            throw new Error("Polygon does not have any points.");
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

    get length() {
        return this.lines.reduce((sum, l) => sum + l.length, 0);
    }

    draw() {
        let pixels: Pixel[] = [];
        this.lines.forEach((l) => {
            const diagonalDistance = calculateDiagonalDistance(l.start, l.end);
            for (let step = 0; step <= diagonalDistance; step++) {
                const t = diagonalDistance === 0 ? 0.0 : step / diagonalDistance;
                const { x, y } = lerpPoint(l.start, l.end, t);
                pixels.push({
                    x,
                    y,
                    value: String(this.fill).substring(0, 1),
                });
            }
        });

        return new DrawBuffer(pixels);
    }

    get boundingBox() {
        return calculateBoundingBoxFromPoints(this.points);
    }
}
