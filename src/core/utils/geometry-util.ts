import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { BoundingBox, PointLike } from "@/core/types/primitive-types";
import { parsePositionString } from "@/core/utils/string-util";

export function convertRadianToVector(radian: number): PointLike {
    return { x: Math.cos(radian), y: -Math.sin(radian) };
}

export function calculateRadianBetweenPoints(p0: PointLike, p1: PointLike) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;

    // Flip Y because screen coordinates grow downward
    const result = Math.atan2(-dy, dx);
    if (result < 0) {
        return result + Math.PI * 2;
    }
    return result;
}

export function mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox {
    const allPoints = boxes.reduce<Point[]>((acc, box) => {
        // top left
        acc.push(new Point(box.left, box.top));

        // top right
        acc.push(new Point(box.left + box.width, box.top));

        // bottom left
        acc.push(new Point(box.left, box.bottom));

        // bottom right
        acc.push(new Point(box.left + box.width, box.top));
        return acc;
    }, []);
    return calculateBoundingBoxFromPoints(allPoints);
}

export function calculateVectorBetweenPoints(p0: PointLike, p1: PointLike) {
    const radian = calculateRadianBetweenPoints(p0, p1);
    return convertRadianToVector(radian);
}

export function calculateTotalDistanceBetweenPoints(points: PointLike[]) {
    return points.reduce((total, point, i) => {
        const nextPoint = points.at(i + 1);
        if (nextPoint) {
            total += Math.hypot(nextPoint.x - point.x, nextPoint.y - point.y);
        }
        return total;
    }, 0);
}

export function calculateRelativeOriginPoint(parent: { width: number; height: number }, child: { width: number; height: number }, positionString = "") {
    if (!positionString || positionString.trim() === "") {
        return Point.ZeroZero;
    }
    const offset = parsePositionString(positionString);
    let offsetX = 0;
    let offsetY = 0;
    if (offset.x.is_percent) {
        offsetX = parent.width * offset.x.value - child.width * offset.x.value;
    } else {
        offsetX = offset.x.value;
    }
    if (offset.y.is_percent) {
        offsetY = parent.height * offset.y.value - child.height * offset.y.value;
    } else {
        offsetY = offset.y.value;
    }
    return new Point(offsetX, offsetY);
}

export function trimPointsToLength(points: PointLike[], maxLength: number) {
    const clonedPoints = points.map((p) => new Point(p));
    let total = 0;
    const trimmedPoints: Point[] = [];
    let i = 0;
    while (total < maxLength && i < clonedPoints.length) {
        const point = clonedPoints[i];
        if (!point) {
            throw new Error("Missing point.");
        }
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

export function isPointInsideRectangle(point: PointLike, shape: Rectangle) {
    const isInXRange = point.x >= shape.position.x && point.x < shape.position.x + shape.width;
    const isInYRange = point.y >= shape.position.y && point.y < shape.position.y + shape.height;
    return isInXRange && isInYRange;
}

export function calculateBoundingBoxFromPoints(points: PointLike[]): BoundingBox {
    const dimensions = points.reduce<BoundingBox>(
        (acc, point) => {
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
        },
        { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 }
    );

    return {
        ...dimensions,
        width: dimensions.right - dimensions.left,
        height: dimensions.bottom - dimensions.top,
    };
}
