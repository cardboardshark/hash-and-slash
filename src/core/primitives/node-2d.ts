import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Point } from "@/core/primitives/point";
import { BoundingBox, PointLike } from "@/core/types/primitive-types";
import { mergeBoundingBoxes } from "@/core/utils/geometry-util";
import { lerp } from "@/core/utils/math-utils";
import { parsePositionString } from "@/core/utils/string-util";

let id = -1;
export class Node2d {
    id: string;
    x = 0;
    y = 0;
    nodeId: number;
    children: Node2d[] = [];

    // defaults to top-left of element
    origin?: string;

    constructor() {
        this.nodeId = id;
        this.id = `Node2d-${this.nodeId}`;
        id += 1;
    }

    set(point: PointLike) {
        this.x = point.x;
        this.y = point.y;
        return this;
    }

    get position(): Point {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    }

    get precisePosition() {
        return new Point(this.x, this.y);
    }

    set position(point: PointLike) {
        this.x = point.x;
        this.y = point.y;
    }

    get originPosition() {
        if (this.origin == undefined) {
            return this.position;
        }

        const dimensions = this.boundingBox;
        const originOffset = parsePositionString(this.origin);
        let offsetX = 0;
        let offsetY = 0;

        // hacky
        if (originOffset.x.is_percent) {
            offsetX = lerp(0, (dimensions.width - 1) * -1, originOffset.x.value);
        } else {
            offsetX = originOffset.x.value;
        }
        if (originOffset.y.is_percent) {
            offsetY = lerp(0, (dimensions.height - 1) * -1, originOffset.y.value);
        } else {
            offsetY = originOffset.y.value;
        }

        return this.position.add(new Point(offsetX, offsetY));
    }

    setOrigin(value?: string) {
        this.origin = value;
        return this;
    }

    appendChild(node: Node2d) {
        if (this.children.includes(node) === false) {
            this.children.push(node);
        }
        return this;
    }
    removeChild(node: Node2d) {
        this.children = this.children.filter((n) => n !== node);
        return this;
    }
    setChildren(nodeList: Node2d[]) {
        this.children = nodeList;
        return this;
    }

    get boundingBox(): BoundingBox {
        return mergeBoundingBoxes(this.children.map((c) => c.boundingBox));
    }

    draw() {
        const buffer = new DrawBuffer();
        this.children.forEach((c) => buffer.merge(c.draw(), { offset: c.originPosition }));
        return buffer;
    }
}
