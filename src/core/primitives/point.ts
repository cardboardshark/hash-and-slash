import type { PointLike, LineLike } from "@/core/types";
import { inRange } from "lodash";

export class Point {
    x: number;
    y: number;

    static ZeroZero = { x: 0, y: 0 } as const;

    constructor(x: number, y: number);
    constructor(point: PointLike);
    constructor(pointOrX: number | PointLike, y?: number) {
        if (typeof pointOrX === "object" && pointOrX !== null) {
            this.x = pointOrX.x;
            this.y = pointOrX.y;
        } else if (y !== undefined) {
            this.x = pointOrX;
            this.y = y;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    isZeroZero() {
        return this.x == 0 && this.y === 0;
    }

    add(point: PointLike) {
        return new Point({ x: this.x + point.x, y: this.y + point.y });
    }
    subtract(point: PointLike) {
        return new Point({ x: this.x - point.x, y: this.y - point.y });
    }
    ceil() {
        return new Point(Math.ceil(this.x), Math.ceil(this.y));
    }
    floor() {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    }
    round() {
        return new Point(Math.round(this.x), Math.round(this.y));
    }
    clone() {
        return new Point(this);
    }

    distanceTo(point: PointLike) {
        return Math.hypot(point.x - this.x, point.y - this.y);
    }

    equals(point?: PointLike) {
        if (!point) {
            return false;
        }
        return this.x === point.x && this.y === point.y;
    }

    // do some rounding and fudgery to manage floating positions
    roughlyEquals(point: PointLike, fuzziness = 0.5) {
        if (!point) {
            return false;
        }
        return inRange(point.x, this.x - fuzziness, this.x + fuzziness) && inRange(point.y, this.y - fuzziness, this.y + fuzziness);
    }

    normalize() {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Point(this.x / magnitude, this.y / magnitude);
    }

    dot(point: PointLike) {
        return this.x * point.x + this.y * point.y;
    }

    cross(point: PointLike) {
        return this.x * point.y - this.y * point.x;
    }
    reflect(normal: PointLike) {
        // Given an incident vector i and a normal vector n, returns the reflection vector r = i - 2 * dot(i, n) * n

        const dotProduct = this.dot(normal);

        const outX = this.x - 2 * dotProduct * normal.x;
        const outY = this.y - 2 * dotProduct * normal.y;

        return new Point(outX, outY);
    }

    multiply(point: PointLike) {
        return new Point({
            x: this.x * point.x,
            y: this.y * point.y,
        });
    }

    multiplyScalar(magnitude: number) {
        return new Point({
            x: this.x * magnitude,
            y: this.y * magnitude,
        });
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    project(vector: PointLike, magnitude: number) {
        const distance = new Point(vector).multiplyScalar(magnitude);
        return new Point(this).add(distance);
    }

    // Based on line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    // Determine the intersection point of two line segments
    // Return FALSE if the lines don't intersect
    getIntersectionWithLine(vector: PointLike, lineB: LineLike) {
        const { x: x1, y: y1 } = this;
        let { x: x2, y: y2 } = vector;
        x2 += this.x;
        y2 += this.y;

        const { x: x3, y: y3 } = lineB.start;
        const { x: x4, y: y4 } = lineB.end;

        // x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number
        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }

        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

        // Lines are parallel
        if (denominator === 0) {
            return false;
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }

        // Return a object with the x and y coordinates of the intersection
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);

        return { x, y };
    }
}
