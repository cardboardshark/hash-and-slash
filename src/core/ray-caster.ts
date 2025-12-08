import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Polygon } from "@/core/primitives/polygon";
import { Ray } from "@/core/primitives/ray";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import { CollisionResult } from "@/core/types/intersection-types";
import { Renderable, isPointLike } from "@/core/types/primitive-types";
import { findLineIntersection } from "@/core/utils/collision-util";
import { orderBy } from "lodash";

export class RayCaster {
    firstIntersection?: CollisionResult;
    intersections?: CollisionResult[];
    hasIntersection;

    constructor(lineOrRay: Line | Ray, haystack: Renderable | Renderable[]) {
        const line = lineOrRay instanceof Ray ? lineOrRay.line : lineOrRay;
        const haystackAsArray = Array.isArray(haystack) ? haystack : [haystack];

        const intersections = haystackAsArray.reduce<CollisionResult[]>((acc, shape) => {
            const intersection = this.#test(line, shape);
            if (intersection.length > 0) {
                acc.push(...intersection);
            }
            return acc;
        }, []);

        const sortedIntersections = orderBy(
            intersections,
            ({ point }) => {
                const distanceFromPrimaryRay = new Point(line.start).distanceTo(point);
                return distanceFromPrimaryRay;
            },
            "asc"
        );
        this.intersections = sortedIntersections;
        this.firstIntersection = sortedIntersections.at(0);
        this.hasIntersection = intersections.length > 0;
    }

    #test(line: Line, shape: Renderable): CollisionResult[] {
        if (shape instanceof Polygon || shape instanceof Rectangle || shape instanceof PolyLine) {
            return shape.lines.reduce<CollisionResult[]>((acc, l) => {
                const point = findLineIntersection(line, l);
                if (point) {
                    acc.push({ point, shape, face: l });
                }
                return acc;
            }, []);
        }

        if (shape instanceof Text) {
            const rectangle = new Rectangle(new Point(shape.boundingBox.left, shape.boundingBox.top), shape.boundingBox.width, shape.boundingBox.height);
            return this.#test(line, rectangle);
        }

        if (shape instanceof Line) {
            const point = findLineIntersection(line, shape);
            if (point) {
                return [{ point, shape, face: shape }];
            }
        }

        if (isPointLike(shape)) {
            if (line.toPoints().some(({ x, y }) => shape.x === x && shape.y === y)) {
                return [{ point: shape }];
            }
        }

        return [];
    }
}
