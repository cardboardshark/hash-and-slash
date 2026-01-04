import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { LineShape } from "@/core/primitives/line-shape";
import { PolyLineShape } from "@/core/primitives/poly-line-shape";
import { Text } from "@/core/primitives/text";
import { Background } from "@/core/shaders/background";
import { Shader } from "@/core/shaders/shader";
import { BackgroundOptions, BoundingBox, PointLike, PointLikeFn } from "@/core/types/primitive-types";
import { mergeBoundingBoxes, offsetBoundingBox } from "@/core/utils/geometry-util";
import { lerp } from "@/core/utils/math-utils";
import { parsePositionString } from "@/core/utils/string-util";

type ValidChildren = Node2d | LineShape | PolyLineShape;
let id = -1;
export class Node2d {
    id: string;
    x = 0;
    y = 0;
    pointReferenceFn?: () => { x: number; y: number };
    nodeId: number;
    children = new Set<ValidChildren>();
    visible = true;
    parent?: Node2d;
    background?: string | number | Background | BackgroundOptions;
    shaders: Shader[] = [];
    rotate = 0;
    _debug: boolean = false;

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

    get dimensions() {
        return { width: 0, height: 0 };
    }

    get originPosition() {
        if (this.origin === undefined) {
            return this.position;
        }

        const dimensions = this.dimensions;

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
            this.memoizedBoundingBox = mergeBoundingBoxes(Array.from(this.children.values()).map((c) => c.boundingBox));
            this.hasBoundingBoxChanged = false;
        }

        return this.origin !== undefined ? offsetBoundingBox(this.memoizedBoundingBox, this.originPosition) : this.memoizedBoundingBox;
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

    getFaces() {
        const dimensions = this.boundingBox;
        return [
            // top
            new Line(this.position, this.position.add({ x: dimensions.width, y: 0 })),
            // right
            new Line(this.position.add({ x: dimensions.width, y: 0 }), this.position.add({ x: dimensions.width, y: dimensions.height })),
            // bottom
            new Line(this.position.add({ x: 0, y: dimensions.height }), this.position.add({ x: dimensions.width, y: dimensions.height })),
            // left
            new Line(this.position, this.position.add({ x: 0, y: dimensions.height })),
        ];
    }

    draw(): DrawBuffer {
        if (this.visible === false) {
            return new DrawBuffer();
        }

        return Array.from(this.children.values()).reduce<DrawBuffer>((buffer, c) => {
            return buffer.merge(c.draw(), { offset: c.originPosition });
        }, new DrawBuffer());
    }
}
