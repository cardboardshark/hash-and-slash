import { isContainerLike, isPointLike, type ContainerLike, type PointLike, type Renderable } from "@/core/types";
import { Point } from "@/core/primitives/point";

/**
 * Group shapes or sprites together. All children will be positioned relative to the Container's x and y coord.
 */
export class Container {
    children: Renderable[];
    x = 0;
    y = 0;

    constructor(container?: ContainerLike);
    constructor(initial?: Renderable[]);
    constructor(initialOrContainer?: ContainerLike | Renderable[]) {
        if (isContainerLike(initialOrContainer)) {
            this.children = initialOrContainer.children;
            this.set(initialOrContainer.x, initialOrContainer.y);
        } else if (Array.isArray(initialOrContainer)) {
            this.children = initialOrContainer;
        } else {
            this.children = [];
        }
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
