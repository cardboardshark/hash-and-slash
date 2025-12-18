import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { BoundingBox, PointLike, PointLikeFn } from "@/core/types/primitive-types";
import { mergeBoundingBoxes, offsetBoundingBox } from "@/core/utils/geometry-util";
import { lerp } from "@/core/utils/math-utils";
import { parsePositionString } from "@/core/utils/string-util";

type ValidChildren = Node2d | Line | PolyLine;
let id = -1;
export class Node2d {
    id: string;
    x = 0;
    y = 0;
    pointReferenceFn?: () => { x: number; y: number };
    nodeId: number;
    children = new Set<ValidChildren>();
    visible = true;

    // defaults to top-left of element
    origin?: string;
    hasBoundingBoxChanged = false;
    memoizedBoundingBox?: BoundingBox;

    constructor() {
        this.nodeId = id;
        this.id = `Node2d-${this.nodeId}`;
        id += 1;
    }

    set(pointOrPointFn: PointLike | PointLikeFn) {
        if (typeof pointOrPointFn === "function") {
            this.pointReferenceFn = pointOrPointFn;
        } else {
            this.x = pointOrPointFn.x;
            this.y = pointOrPointFn.y;
        }
        this.hasBoundingBoxChanged = true;
        return this;
    }

    get position(): Point {
        if (this.pointReferenceFn) {
            return new Point(this.pointReferenceFn());
        }
        return new Point(Math.floor(this.x), Math.floor(this.y));
    }

    get precisePosition() {
        if (this.pointReferenceFn) {
            return new Point(this.pointReferenceFn());
        }
        return new Point(this.x, this.y);
    }

    get originPosition() {
        if (this.origin === undefined || this.memoizedBoundingBox === undefined) {
            return this.position;
        }

        const dimensions = this.memoizedBoundingBox;
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
        this.hasBoundingBoxChanged = true;
        return this;
    }

    appendChild(node: ValidChildren) {
        if (this.children.has(node) === false) {
            this.children.add(node);
        }
        this.hasBoundingBoxChanged = true;
        return this;
    }
    removeChild(node: ValidChildren) {
        this.children.delete(node);
        this.hasBoundingBoxChanged = true;
        return this;
    }
    setChildren(nodeList: ValidChildren[]) {
        this.children = new Set<ValidChildren>(nodeList);
        this.hasBoundingBoxChanged = true;
        return this;
    }

    get boundingBox(): BoundingBox {
        if (this.memoizedBoundingBox === undefined || this.hasBoundingBoxChanged === true) {
            if (this.children.size > 0) {
                const mergedBox = mergeBoundingBoxes(Array.from(this.children.values()).map((c) => c.boundingBox));
                this.memoizedBoundingBox = offsetBoundingBox(mergedBox, this.originPosition);
                this.hasBoundingBoxChanged = false;
                console.log("done");
            }
        }
        return (
            this.memoizedBoundingBox ?? {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: 0,
                height: 0,
            }
        );
    }

    // get collider(): Polygon {
    //     const dimensions = this.boundingBox;
    //     return new Polygon([
    //         new Point(dimensions.left, dimensions.top),
    //         new Point(dimensions.right, dimensions.top),
    //         new Point(dimensions.right, dimensions.bottom),
    //         new Point(dimensions.left, dimensions.bottom),
    //         new Point(dimensions.left, dimensions.top),
    //     ]);
    // }

    draw() {
        const buffer = new DrawBuffer();
        Array.from(this.children.values())
            .filter((c) => c.visible)
            .forEach((c) => {
                if (c instanceof Node2d) {
                    return buffer.merge(c.draw(), { offset: c.originPosition });
                }
                // lines or polylines
                return buffer.merge(c.draw());
            });
        return buffer;
    }
}
