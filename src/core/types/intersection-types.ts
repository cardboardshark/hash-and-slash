import type { PointLike, ShapeLike, LineLike } from "@/core/types/primitive-types";

export interface CollisionResult {
    point: PointLike;
    shape?: ShapeLike;
    face?: LineLike;
}
