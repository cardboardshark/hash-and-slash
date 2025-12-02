import { Point } from "@/core/primitives/point";
import type { BoundingBox, PointLike } from "@/core/types";

export function lerp(start: number, end: number, t: number) {
    return start * (1.0 - t) + t * end;
}

// from https://www.redblobgames.com/grids/line-drawing/
export function calculateDiagonalDistance(p0: PointLike, p1: PointLike) {
    let dx = p1.x - p0.x,
        dy = p1.y - p0.y;
    return Math.max(Math.abs(dx), Math.abs(dy));
}

export function lerpPoint(p0: PointLike, p1: PointLike, t: number) {
    const lerpedX = lerp(p0.x, p1.x, t);
    const lerpedY = lerp(p0.y, p1.y, t);
    const roundedLerpedX = Math.round(lerpedX);
    const roundedLerpedY = Math.round(lerpedY);
    return new Point(roundedLerpedX, roundedLerpedY);
}

export function calculateBoundingBox(points: PointLike[]): BoundingBox {
    const dimensions = points.reduce<BoundingBox>((acc, point) => {
        acc.left ??= point.x;
        acc.right ??= point.x;
        acc.top ??= point.y;
        acc.bottom ??= point.y;

        if (point.x < acc.left) {
            acc.left = point.x;
        }
        if (point.x > acc.right) {
            acc.right = point.x;
        }
        if (point.y < acc.top) {
            acc.top = point.y;
        }
        if (point.y > acc.bottom) {
            acc.bottom = point.y;
        }
        return acc;
    }, {} as BoundingBox);

    return {
        ...dimensions,
        width: dimensions.right - dimensions.left,
        height: dimensions.bottom - dimensions.top,
    };
}
