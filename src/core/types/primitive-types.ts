import { RigidBody } from "@/core/physics/rigid-body";
import { StaticBody } from "@/core/physics/static-body";
import { Line } from "@/core/primitives/line";
import { Node2d } from "@/core/primitives/node-2d";
import { PolyLine } from "@/core/primitives/poly-line";
import { Polygon } from "@/core/primitives/polygon";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";

export type PhysicsBody = StaticBody | RigidBody;
export type PointLike = { x: number; y: number };

export type RenderableEntity = { toRenderable: () => Omit<Renderable, "RenderableEntity"> };

export interface TextOptions {
    align?: "left" | "center" | "right";
    width?: number;
    maxLines?: number;
    fill?: string;
}

export type Renderable = Node2d | Line | PolyLine | Rectangle | Polygon | Text | RenderableEntity;

export function isPointLike(shape: unknown): shape is PointLike {
    return typeof shape === "object" && shape !== null && "x" in shape && "y" in shape;
}

export function isRenderableEntity(shape: unknown): shape is RenderableEntity {
    return typeof shape === "object" && shape !== null && "toRenderable" in shape;
}

export interface BoundingBox {
    left: number;
    right: number;
    bottom: number;
    top: number;
    width: number;
    height: number;
}

export interface TextureOptions {
    src: string;
    position?: string;
    fill?: number | string | null;
}
