import { RigidBody } from "@/core/physics/rigid-body";
import { StaticBody } from "@/core/physics/static-body";
import { Line } from "@/core/primitives/line";
import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { RayCaster } from "@/core/ray-caster";
import { PhysicsBody } from "@/core/types/primitive-types";
import { TickerDelta } from "@/core/types/ticker-types";
import { doBodiesOverlap } from "@/core/utils/collision-util";

const COLLISION_HULL_THICKNESS = 0.5;
export class Scene extends Node2d {
    id = "scene";

    #bodyRegistry = new Set<PhysicsBody>();

    appendChild(node: Node2d) {
        if (node instanceof RigidBody || node instanceof StaticBody) {
            this.#bodyRegistry.add(node);
        }
        return super.appendChild(node);
    }
    removeChild(node: Node2d) {
        if (node instanceof RigidBody || node instanceof StaticBody) {
            this.#bodyRegistry.delete(node);
        }
        return super.removeChild(node);
    }

    process(delta: TickerDelta) {
        const allBodies = Array.from(this.#bodyRegistry);
        const rigidBodies = allBodies.filter((body) => body instanceof RigidBody);

        rigidBodies.forEach((body) => {
            let initialPosition = body.position.clone();
            let currentPosition = body.position.clone();

            if (body.constantForce) {
                const constantForceVector = body.constantForce.multiplyScalar(body.inertia * delta.deltaMS);
                currentPosition = body.precisePosition.add(constantForceVector);
            }
            // console.log(initialPosition, currentPosition);
            if (initialPosition.equals(currentPosition) === false) {
                body.position = currentPosition;

                // fast loose check
                const bodiesWithBoundingBoxContact = allBodies.filter((other) => other !== body && doBodiesOverlap(body, other));

                // more detailed check
                const raysWithBodyContact = new Map<PhysicsBody, RayCaster>();

                let staticContact: PhysicsBody | undefined;
                bodiesWithBoundingBoxContact.forEach((other) => {
                    if (body.constantForce) {
                        const travelRay = new Line(initialPosition, currentPosition);

                        const otherRect = new Rectangle(
                            other.position.subtract(new Point(COLLISION_HULL_THICKNESS, COLLISION_HULL_THICKNESS)),
                            other.boundingBox.width,
                            other.boundingBox.height
                        );
                        const travelIntersection = new RayCaster(travelRay, otherRect);
                        if (travelIntersection.hasIntersection) {
                            raysWithBodyContact.set(other, travelIntersection);
                            if (other instanceof StaticBody) {
                                staticContact = other;
                            }
                        }
                    }
                });

                if (staticContact) {
                    // bounce off solid object
                    const ray = raysWithBodyContact.get(staticContact);
                    if (ray?.firstIntersection && body.constantForce) {
                        // hacky
                        // if (item.constantForce.x > 0 || item.constantForce.y > 0) {

                        const reverseVector = new Point(ray.firstIntersection.point).subtract(body.constantForce.add(ray.firstIntersection.point));
                        body.position = ray.firstIntersection.point.add(reverseVector);
                        console.log("hmssssada", reverseVector);
                        // } else {
                        //     item.position = ray.firstIntersection.point;
                        // }

                        // item.position = ray.firstIntersection.point;
                        // item.constantForce = new Point(Point.ZeroZero);
                        // console.log("safe", ray.firstIntersection.point, safePoint);
                    }

                    body.bodyEntered(staticContact);
                } else {
                    // pass through rigid object
                    raysWithBodyContact.forEach((_ray, other) => {
                        if (body.contacts.has(other) === false) {
                            body.contacts.add(other);
                            body.bodyEntered(other);
                        }
                    });

                    body.contacts.forEach((other) => {
                        if (bodiesWithBoundingBoxContact.includes(other) === false) {
                            body.contacts.delete(other);
                            body.bodyExited(other);
                        }
                    });
                }
            }
        });
    }
}
