import { Node2d } from "@/core/primitives/node-2d";
import { IntersectingPixels } from "@/core/types/primitive-types";

export class PhysicsBody extends Node2d {
    contacts = new Set<PhysicsBody>();

    bodyEntered(other: PhysicsBody, intersections: IntersectingPixels[]) {}

    bodyExited(other: PhysicsBody) {}

    bodyContact(intersections: IntersectingPixels[]) {}
}
