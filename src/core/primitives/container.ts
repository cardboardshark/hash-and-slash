import { Point } from "@/core/primitives/point";
import { Renderable, PointLike } from "@/core/types/primitive-types";

/**
 * Group shapes or sprites together. All children will be positioned relative to the Container's x and y coord.
 */
export class Container {
    children: Renderable[];
    x = 0;
    y = 0;
    _debug: boolean = false;

    constructor(initial: Renderable[] = []) {
        this.children = initial;
    }

    add(value: Renderable) {
        this.children.push(value);
    }

    prepend(value: Renderable) {
        this.children.unshift(value);
    }

    get position() {
        return new Point(this.x, this.y);
    }

    set(point: PointLike) {
        this.x = point.x;
        this.y = point.y;
        return this;
    }
}
