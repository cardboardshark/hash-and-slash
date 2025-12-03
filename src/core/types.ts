type Paintable = {
    fill?: string;
    stroke?: string;
};
export type SpriteLike = PointLike & { content: string | number };
export type PointLike = { x: number; y: number };
export type LineLike = { start: PointLike; end: PointLike } & Paintable;
export type RectangleLike = { topLeft: PointLike; bottomRight: PointLike; lines: LineLike[] } & Paintable;
export type PolygonLike = { points: PointLike[]; lines: LineLike[]; closed: true } & Paintable;
export type PolyLineLike = { points: PointLike[]; lines: LineLike[]; closed: false } & Paintable;
export type TextLike = PointLike & { text: string | number; options?: TextOptions };
export type GroupLike = PointLike & { items: (SpriteLike | ShapeLike | GroupLike)[] };
export type ShapeLike = LineLike | RectangleLike | PolygonLike | PolyLineLike | TextLike;

export type Renderable = ShapeLike | SpriteLike;

export interface TextOptions {
    align?: "left" | "center" | "right";
    width?: number;
    maxLines?: number;
    fill?: string;
}

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
export function isSpriteLike(shape: unknown): shape is SpriteLike {
    return isPointLike(shape) && "content" in shape;
}
export function isTextLike(shape: unknown): shape is TextLike {
    return isPointLike(shape) && "text" in shape;
}
export function isPolygonLike(shape: unknown): shape is PolygonLike {
    return typeof shape === "object" && shape !== null && "lines" in shape && "closed" in shape && shape.closed === true;
}
export function isPolyLineLike(shape: unknown): shape is PolyLineLike {
    return typeof shape === "object" && shape !== null && "lines" in shape && "closed" in shape && shape.closed === false;
}
export function isRectangleLike(shape: unknown): shape is RectangleLike {
    return typeof shape === "object" && shape !== null && "topLeft" in shape;
}
export function isLineLike(shape: unknown): shape is LineLike {
    return typeof shape === "object" && shape !== null && "start" in shape && "end" in shape;
}

export interface CollisionResult {
    point: PointLike;
    shape?: ShapeLike;
    face?: LineLike;
}

export interface BoundingBox {
    left: number;
    right: number;
    bottom: number;
    top: number;
    width: number;
    height: number;
}
