import type { Line } from "@/core/primitives/line";
import type { Point } from "@/core/primitives/point";

export type SpriteLike = PointLike & { content: string | number };
export type PointLike = { x: number; y: number };
export type LineLike = { start: PointLike; end: PointLike };
export type RectangleLike = { topLeft: PointLike; bottomRight: PointLike; lines: LineLike[] };
export type PolygonLike = { points: PointLike[]; lines: LineLike[] };
export type Shape = LineLike | RectangleLike | PolygonLike;

export type PaintOptions =
    | {
          fill: string;
          stroke: string;
      }
    | {
          fill: string;
          stroke?: string;
      }
    | {
          fill?: string;
          stroke: string;
      };

export function isPointLike(shape: unknown): shape is PointLike {
    return typeof shape === "object" && shape !== null && "x" in shape && "y" in shape;
}

export function isPolygonLike(shape: unknown): shape is PolygonLike {
    return typeof shape === "object" && shape !== null && "lines" in shape;
}
export function isRectangleLike(shape: unknown): shape is RectangleLike {
    return typeof shape === "object" && shape !== null && "topLeft" in shape;
}
export function isLineLike(shape: unknown): shape is LineLike {
    return typeof shape === "object" && shape !== null && "start" in shape && "end" in shape;
}

export interface IntersectionResult {
    point: Point;
    line: Line;
}
