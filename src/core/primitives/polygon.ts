import type { PolygonLike, PointLike, PaintOptions } from "@/core/types";
import { Line } from "./line";
import type { Sprite } from "./sprite";

export class Polygon implements PolygonLike {
    points;
    lines;

    constructor(points: PointLike[] = []) {
        this.points = points;
        this.lines = [];
        for (let i = 0; i <= points.length; i += 1) {
            const nextPoint = points.at(i + 1);
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

    toSprite(options: PaintOptions = { fill: " ", stroke: " " }): Sprite[] {
        return this.lines.flatMap((l) => l.toSprite(options.stroke));
    }
}
