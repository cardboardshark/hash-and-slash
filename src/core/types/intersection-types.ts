import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Shape } from "@/core/primitives/shape";

export interface CollisionResult {
    point: Point;
    shape?: Shape;
    face?: Line;
}
