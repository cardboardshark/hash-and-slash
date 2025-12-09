import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Shape } from "@/core/primitives/shape";
import { Pixel } from "@/core/types/canvas-types";
import { BoundingBox, PointLike } from "@/core/types/primitive-types";

import { calculateBoundingBoxFromPoints, trimPointsToLength } from "@/core/utils/geometry-util";

export class PolyLine extends Shape {
    x;
    y;
    points: Point[];
    closed: false = false;
    boundingBox;
    fill = "l";

    constructor(points: PointLike[]) {
        super();

        this.points = points.map((p) => new Point(p));

        this.x = this.points[0]?.x ?? 0;
        this.y = this.points[0]?.y ?? 0;

        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    clone() {
        return new PolyLine(this.points);
    }

    add(point: PointLike) {
        this.points.push(new Point(point));
        this.boundingBox = PolyLine.calculateBoundingBox(this);
    }

    prepend(point: PointLike) {
        this.points.unshift(new Point(point));
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
        this.boundingBox = PolyLine.calculateBoundingBox(this);

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

    toPixels(): PixelGrid {
        // prevent duplicate points
        let pixelMap = new Map<string, Pixel>();
        this.lines.forEach((l) => {
            l.toPoints().forEach((p) => {
                pixelMap.set(`${p.x},${p.y}`, { x: p.x, y: p.y, value: String(this.fill).substring(0, 1) });
            });
        });

        return new PixelGrid(Array.from(pixelMap.values()));
    }

    static calculateBoundingBox(polyLine: PolyLine): BoundingBox {
        return calculateBoundingBoxFromPoints(polyLine.points);
    }
}
