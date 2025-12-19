import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { PointLike } from "@/core/types/primitive-types";
import { inRange } from "lodash";

export class Point {
    x = 0;
    y = 0;

    static ZeroZero = { x: 0, y: 0 } as const;

    constructor(x: number, y: number);
    constructor(point: PointLike);
    constructor(firstArg: number | PointLike, y?: number) {
        if (typeof firstArg === "object" && firstArg !== null) {
            this.x = firstArg.x;
            this.y = firstArg.y;
        } else if (y !== undefined) {
            this.x = firstArg;
            this.y = y;
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

    // v. hacky
    rotate(degrees: 90 | 180 | 270) {
        if (degrees === 90) {
            return new Point(this.y * -1, this.x);
        }
        if (degrees === 180) {
            return new Point(this.x * -1, this.y * -1);
        }
        if (degrees === 270) {
            return new Point(this.y, this.x * -1);
        }
        return this.clone();
    }

    multiply(point: PointLike) {
        return new Point({
            x: this.x * point.x,
            y: this.y * point.y,
        });
    }

    multiplyScalar(magnitude: number, precision = 5) {
        return new Point({
            x: parseFloat((this.x * magnitude).toFixed(precision)),
            y: parseFloat((this.y * magnitude).toFixed(precision)),
        });
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    toPrecision(decimals: number) {
        return new Point({
            x: parseFloat(this.x.toFixed(decimals)),
            y: parseFloat(this.y.toFixed(decimals)),
        });
    }

    project(vector: PointLike, magnitude: number) {
        const distance = new Point(vector).multiplyScalar(magnitude);
        return new Point(this).add(distance);
    }

    draw() {
        return new DrawBuffer([{ x: this.x, y: this.y, value: "P" }]);
    }
}
