import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { PointLike, PointLikeFn } from "@/core/types/primitive-types";

export class Rectangle {
    x = 0;
    y = 0;
    pointReferenceFn?: PointLikeFn;
    width;
    height;

    constructor(point: PointLike | PointLikeFn, width: number, height: number) {
        this.set(point);
        this.width = width;
        this.height = height;
    }

    set(pointOrPointFn: PointLike | PointLikeFn) {
        if (typeof pointOrPointFn === "function") {
            this.pointReferenceFn = pointOrPointFn;
        } else {
            this.x = pointOrPointFn.x;
            this.y = pointOrPointFn.y;
        }
        return this;
    }

    get dimensions() {
        return { width: this.width, height: this.height };
    }

    get boundingBox() {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            bottom: this.position.y + this.height,
            top: this.position.y,
            width: this.width,
            height: this.height,
        };
    }

    get position() {
        if (this.pointReferenceFn) {
            return new Point(this.pointReferenceFn());
        }
        return new Point(this.x, this.y);
    }

    get lines() {
        return [
            // top
            new Line(this.position, this.position.add({ x: this.width, y: 0 })),
            // right
            new Line(this.position.add({ x: this.width, y: 0 }), this.position.add({ x: this.width, y: this.height })),
            // bottom
            new Line(this.position.add({ x: 0, y: this.height }), this.position.add({ x: this.width, y: this.height })),
            // left
            new Line(this.position, this.position.add({ x: 0, y: this.height })),
        ];
    }
}
