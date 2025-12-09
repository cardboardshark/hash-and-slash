import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Point } from "@/core/primitives/point";
import { Shape } from "@/core/primitives/shape";
import { Pixel } from "@/core/types/canvas-types";
import { PointLike, BoundingBox } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints, calculateRadianBetweenPoints, convertRadianToVector } from "@/core/utils/geometry-util";
import { calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";

export class Line extends Shape {
    x;
    y;
    start;
    end;
    boundingBox;
    fill = "l";

    constructor(p0: PointLike, p1: PointLike) {
        super();
        this.start = new Point(p0);
        this.end = new Point(p1);

        this.x = this.start.x;
        this.y = this.start.y;

        this.boundingBox = Line.calculateBoundingBox(this);
    }

    get length() {
        return this.start.distanceTo(this.end);
    }

    get radian() {
        return calculateRadianBetweenPoints(this.start, this.end);
    }

    toPoints() {
        const points: PointLike[] = [];
        const N = calculateDiagonalDistance(this.start, this.end);
        for (let step = 0; step <= N; step++) {
            let t = N === 0 ? 0.0 : step / N;
            points.push(lerpPoint(this.start, this.end, t));
        }
        return points;
    }

    rotate(radian: number) {
        const modulusedRadian = radian % (Math.PI * 2);
        const length = this.length;
        const resultAsRadian = this.radian + modulusedRadian;
        this.end = this.start.add(new Point({ x: Math.cos(resultAsRadian), y: Math.sin(resultAsRadian) }).multiplyScalar(length)).round();
    }

    setLength(length: number) {
        this.end = this.start.project(convertRadianToVector(this.radian), length);
        this.boundingBox = Line.calculateBoundingBox(this);
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

    toPixels() {
        let pixels: Pixel[] = [];
        const diagonalDistance = calculateDiagonalDistance(this.start, this.end);
        for (let step = 0; step <= diagonalDistance; step++) {
            const t = diagonalDistance === 0 ? 0.0 : step / diagonalDistance;
            const { x, y } = lerpPoint(this.start, this.end, t);
            pixels.push({
                x,
                y,
                value: String(this.fill).substring(0, 1),
            });
        }
        return new PixelGrid(pixels);
    }

    static calculateBoundingBox(line: Line): BoundingBox {
        return calculateBoundingBoxFromPoints([line.start, line.end]);
    }
}
