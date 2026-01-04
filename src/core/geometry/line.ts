import { Point } from "@/core/geometry/point";
import { PointLike } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints, calculateRadianBetweenPoints, convertRadianToVector } from "@/core/utils/geometry-util";

/** Geometry line that cannot be directly drawn. */
export class Line {
    start;
    end;

    constructor(p0: PointLike, p1: PointLike) {
        this.start = new Point(p0);
        this.end = new Point(p1);
    }

    get length() {
        return this.start.distanceTo(this.end);
    }

    get radian() {
        return calculateRadianBetweenPoints(this.start, this.end);
    }

    get points() {
        return [this.start, this.end];
    }

    get dimensions() {
        const box = calculateBoundingBoxFromPoints(this.points);
        return { width: box.width, height: box.height };
    }

    get boundingBox() {
        return calculateBoundingBoxFromPoints(this.points);
    }

    rotate(radian: number) {
        const modulusedRadian = radian % (Math.PI * 2);
        const length = this.length;
        const resultAsRadian = this.radian + modulusedRadian;
        this.end = this.start.add(new Point({ x: Math.cos(resultAsRadian), y: Math.sin(resultAsRadian) }).multiplyScalar(length)).round();
    }

    setLength(length: number) {
        this.end = this.start.project(convertRadianToVector(this.radian), length);
        return this;
    }

    getNormal() {
        // Direction vector of the line
        let dx = this.end.x - this.start.x;
        let dy = this.end.y - this.start.y;

        // Perpendicular vector (one of the two possible normals)
        let normalX = -dy;
        let normalY = dx;

        // Calculate magnitude to normalize
        let magnitude = Math.sqrt(normalX * normalX + normalY * normalY);

        // Handle the case of a zero-length line (points are identical)
        if (magnitude === 0) {
            return new Point(0, 0);
        }

        // Return the unit normal vector
        return new Point(normalX / magnitude, normalY / magnitude);
    }
}
