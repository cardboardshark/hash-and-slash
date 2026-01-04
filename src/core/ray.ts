import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { PhysicsBody } from "@/core/physics/physic-body";
import { CollisionResult } from "@/core/types/intersection-types";
import { findLineIntersection } from "@/core/utils/collision-util";
import { orderBy } from "lodash";

export class Ray {
    firstIntersection?: CollisionResult;
    intersections: CollisionResult[] = [];
    hasIntersection;

    constructor(line: Line, bodies: PhysicsBody[]) {
        const intersections = bodies.reduce<CollisionResult[]>((acc, target) => {
            const bodyIntersections = target.getFaces().reduce<CollisionResult[]>((collisions, face) => {
                const point = findLineIntersection(line, face);
                if (point) {
                    collisions.push({ point, target, face });
                }
                return collisions;
            }, []);

            if (bodyIntersections.length > 0) {
                acc.push(...bodyIntersections);
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
}
