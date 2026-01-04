import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { Rectangle } from "@/core/geometry/rectangle";
import { PhysicsBody } from "@/core/physics/physic-body";
import { BoundingBox } from "@/core/types/primitive-types";

export function doBodiesOverlap(bodyA: PhysicsBody, bodyB: PhysicsBody, collisonHullThickness = 0) {
    const aRect = {
        x: bodyA.boundingBox.left - collisonHullThickness,
        y: bodyA.boundingBox.top - collisonHullThickness,
        width: bodyA.boundingBox.width + collisonHullThickness * 2,
        height: bodyA.boundingBox.height + collisonHullThickness * 2,
    };
    const bRect = {
        x: bodyB.boundingBox.left - collisonHullThickness,
        y: bodyB.boundingBox.top - collisonHullThickness,
        width: bodyB.boundingBox.width + collisonHullThickness * 2,
        height: bodyB.boundingBox.height + collisonHullThickness * 2,
    };
    return aRect.x < bRect.x + bRect.width && aRect.x + aRect.width > bRect.x && aRect.y < bRect.y + bRect.height && aRect.y + aRect.height > bRect.y;
}

export function isBoundingBoxWithinRectangle(box: BoundingBox, rect: Rectangle) {
    const aRect = {
        x: box.left,
        y: box.top,
        width: box.width,
        height: box.height,
    };
    const bRect = {
        x: rect.position.x,
        y: rect.position.y,
        width: rect.position.x + rect.width,
        height: rect.position.y + rect.height,
    };
    return aRect.x < bRect.x + bRect.width && aRect.x + aRect.width > bRect.x && aRect.y < bRect.y + bRect.height && aRect.y + aRect.height > bRect.y;
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
export function findLineIntersection(lineA: Line, lineB: Line) {
    const { x: x1, y: y1 } = lineA.start;
    const { x: x2, y: y2 } = lineA.end;

    const { x: x3, y: y3 } = lineB.start;
    const { x: x4, y: y4 } = lineB.end;

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false;
    }

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel
    if (denominator === 0) {
        return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return new Point(x, y);
}
