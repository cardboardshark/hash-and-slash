import { Point } from "@/core/primitives/point";
import type { PointLike } from "@/core/types";

export function convertRadianToVector(radian: number): PointLike {
    return { x: Math.cos(radian), y: Math.sin(radian) };
}

export function calculateRadianBetweenPoints(p0: PointLike, p1: PointLike) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

export function calculateVectorBetweenPoints(p0: PointLike, p1: PointLike) {
    const radian = calculateRadianBetweenPoints(p0, p1);
    return convertRadianToVector(radian);
}

export function trimPointsToLength(points: PointLike[], maxLength: number) {
    const clonedPoints = points.map((p) => new Point(p));
    let total = 0;
    const trimmedPoints: Point[] = [];
    let i = 0;
    while (total < maxLength && i < clonedPoints.length) {
        const point = clonedPoints[i];
        trimmedPoints.push(point);
        const nextPoint = clonedPoints.at(i + 1);
        if (nextPoint) {
            const distanceToNextPoint = point.distanceTo(nextPoint);
            total += distanceToNextPoint;
            if (total > maxLength) {
                const overflow = total - maxLength;
                const remainder = distanceToNextPoint - overflow;
                const replacementNextPoint = point.project(calculateVectorBetweenPoints(point, nextPoint), remainder).round();
                trimmedPoints.push(replacementNextPoint);
            }
        }

        i += 1;
    }
    return trimmedPoints;
}
