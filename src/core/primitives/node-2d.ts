import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Point } from "@/core/primitives/point";
import { BoundingBox, PhysicsBody, PointLike } from "@/core/types/primitive-types";
import { mergeBoundingBoxes } from "@/core/utils/geometry-util";

let id = -1;
export class Node2d {
    id: string;
    nodeId: number;
    position: Point = new Point(Point.ZeroZero);
    children: Node2d[] = [];
    body?: PhysicsBody;

    constructor() {
        this.nodeId = id;
        this.id = `Node2d-${this.nodeId}`;
        id += 1;
    }

    set(point: PointLike) {
        this.position.x = point.x;
        this.position.y = point.y;
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
        if (this.id.startsWith("Node2d") === false) {
            console.log("Node2d draw", this.nodeId, this.id, this);
        }
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
