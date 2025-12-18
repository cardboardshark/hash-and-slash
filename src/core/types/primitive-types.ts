import { Line } from "@/core/primitives/line";
import { Node2d } from "@/core/primitives/node-2d";
import { PolyLine } from "@/core/primitives/poly-line";
import { Polygon } from "@/core/primitives/polygon";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import { Pixel } from "@/core/types/canvas-types";

// This contains both direction ( the vector ) and speed ( the magnitude ).
export type Velocity = { x: number; y: number };
export type PointLike = { x: number; y: number };
export type PointLikeFn = () => { x: number; y: number };

export interface TextOptions {
    align?: "left" | "center" | "right";
    width?: number;
    maxLines?: number;
    fill?: string;
}

export type Renderable = Node2d | Line | PolyLine | Rectangle | Polygon | Text;

export function isPointLike(shape: unknown): shape is PointLike {
    return typeof shape === "object" && shape !== null && "x" in shape && "y" in shape;
}

export interface BoundingBox {
    left: number;
    right: number;
    bottom: number;
    top: number;
    width: number;
    height: number;
}

export interface BackgroundOptions {
    src?: string | number;
    position?: string;
    fill?: number | string | null;
}

export interface IntersectingPixels {
    source: Pixel;
    offset: Pixel;
}

export interface SpriteSheetOptions {
    content: string;
    numFrames: number;
    width: number;
    height: number;
    initialIndex?: number;
}
