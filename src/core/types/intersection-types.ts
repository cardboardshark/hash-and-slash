import { Line } from "@/core/geometry/line";
import { Point } from "@/core/geometry/point";
import { PhysicsBody } from "@/core/physics/physic-body";

export interface CollisionResult {
    point: Point;
    target: PhysicsBody;
    face?: Line;
}
