import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Ray } from "@/core/primitives/ray";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import {
    isLineLike,
    isPointLike,
    isPolygonLike,
    isPolyLineLike,
    isRectangleLike,
    isTextLike,
    type CollisionResult,
    type LineLike,
    type PointLike,
    type ShapeLike,
} from "@/core/types";
import { getLineIntersection } from "@/core/utils/collision-util";
import { orderBy } from "lodash";

export class RayCaster {
    firstIntersction?: CollisionResult;
    intersections?: CollisionResult[];
    hasIntersection;
    line;

    constructor(lineOrRay: LineLike | Ray, haystack: PointLike | ShapeLike | (PointLike | ShapeLike)[]) {
        this.line = lineOrRay instanceof Ray ? lineOrRay.line : new Line(lineOrRay);
        const haystackAsArray = Array.isArray(haystack) ? haystack : [haystack];

        const intersections = haystackAsArray.reduce<CollisionResult[]>((acc, shape) => {
            const intersection = this.#test(shape);
            if (intersection.length > 0) {
                acc.push(...intersection);
            }
            return acc;
        }, []);

        const sortedIntersections = orderBy(
            intersections,
            ({ point }) => {
                const distanceFromPrimaryRay = new Point(this.line.start).distanceTo(point);
                return distanceFromPrimaryRay;
            },
            "asc"
        );
        this.intersections = sortedIntersections;
        this.firstIntersction = sortedIntersections.at(0);
        this.hasIntersection = intersections.length > 0;
    }

    #test(shape: PointLike | ShapeLike): CollisionResult[] {
        if (isPolygonLike(shape) || isRectangleLike(shape) || isPolyLineLike(shape)) {
            return shape.lines.reduce<CollisionResult[]>((acc, l) => {
                const point = getLineIntersection(this.line, l);
                if (point) {
                    acc.push({ point, shape, face: l });
                }
                return acc;
            }, []);
        }

        if (isTextLike(shape)) {
            const textAsShape = shape instanceof Text ? shape : new Text(shape);
            const rectangle = new Rectangle(
                new Point(textAsShape.boundingBox.left, textAsShape.boundingBox.top),
                new Point(textAsShape.boundingBox.right, textAsShape.boundingBox.bottom)
            );
            return this.#test(rectangle);
        }

        if (isLineLike(shape)) {
            const point = getLineIntersection(this.line, shape);
            if (point) {
                return [{ point, shape, face: shape }];
            }
        }

        if (isPointLike(shape)) {
            if (this.line.toPoints().some(({ x, y }) => shape.x === x && shape.y === y)) {
                return [{ point: shape }];
            }
        }

        return [];
    }
}
