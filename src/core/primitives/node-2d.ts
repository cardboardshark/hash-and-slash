import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Point } from "@/core/primitives/point";
import { BoundingBox, PhysicsBody, PointLike } from "@/core/types/primitive-types";
import { mergeBoundingBoxes } from "@/core/utils/geometry-util";

let id = -1;
export class Node2d {
    id: string;
    x = 0;
    y = 0;
    nodeId: number;
    children: Node2d[] = [];
    body?: PhysicsBody;

    constructor() {
        this.nodeId = id;
        this.id = `Node2d-${this.nodeId}`;
        id += 1;
    }

    set(point: PointLike) {
        this.x = point.x;
        this.y = point.y;
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

    _draw() {
        const buffer = new DrawBuffer();
        // current scope
        buffer.merge(this.draw(), { offset: this.position });

        // continue down structure
        this.children.forEach((c) => buffer.merge(c._draw(), { offset: this.position }));
        return buffer;
    }

    draw() {
        return new DrawBuffer();
    }
}
