import { Point } from "@/core/primitives/point";
import { Renderable, PointLike, isPointLike } from "@/core/types/primitive-types";

/**
 * Group shapes or sprites together. All children will be positioned relative to the Container's x and y coord.
 */
export class Container {
    children: Renderable[];
    x = 0;
    y = 0;

    constructor(initial: Renderable[] = []) {
        this.children = initial;
    }

    add(value: Renderable) {
        this.children.push(value);
    }

    get point() {
        return new Point(this.x, this.y);
    }

    set(point: PointLike): this;
    set(x: number, y: number): this;
    set(xOrPoint: number | PointLike, y?: number) {
        if (isPointLike(xOrPoint)) {
            this.x = xOrPoint.x;
            this.y = xOrPoint.y;
        } else if (y !== undefined) {
            this.x = xOrPoint;
            this.y = y;
        }
        return this;
    }
}
