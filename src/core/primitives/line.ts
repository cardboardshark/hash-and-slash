import { Buffer } from "@/core/pipeline/buffer";
import { Point } from "@/core/primitives/point";
import { Shader } from "@/core/shaders/shader";
import { Texture } from "@/core/shaders/texture";
import { Pixel } from "@/core/types/canvas-types";
import { PointLike, TextureOptions } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints, calculateRadianBetweenPoints, convertRadianToVector } from "@/core/utils/geometry-util";
import { calculateDiagonalDistance, lerpPoint } from "@/core/utils/math-utils";

export class Line {
    start;
    end;
    fill = "l";
    texture?: string | TextureOptions | Texture;
    shaders: Shader[] = [];

    constructor(p0: PointLike, p1: PointLike) {
        this.start = new Point(p0);
        this.end = new Point(p1);
    }

    get point() {
        return this.start;
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

    toBuffer() {
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
        return new Buffer(pixels);
    }

    get boundingBox() {
        return calculateBoundingBoxFromPoints([this.start, this.end]);
    }
}
