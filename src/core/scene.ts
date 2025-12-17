import { RigidBody } from "@/core/physics/rigid-body";
import { StaticBody } from "@/core/physics/static-body";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { RayCaster } from "@/core/ray-caster";
import { PhysicsBody } from "@/core/types/primitive-types";
import { TickerDelta } from "@/core/types/ticker-types";
import { doBodiesOverlap } from "@/core/utils/collision-util";

const COLLISION_HULL_THICKNESS = 0.5;
export class Scene {
    #bodies: PhysicsBody[] = [];

    constructor() {}

    add(item: PhysicsBody) {
        this.#bodies.push(item);
    }

    process(delta: TickerDelta) {
        const rigidBodies = this.#bodies.filter((body) => body instanceof RigidBody);

        rigidBodies.forEach((item) => {
            let initialPosition = item.position.clone();
            let currentPosition = item.position.clone();

            if (item.constantForce) {
                const constantForceVector = item.constantForce.multiplyScalar(item.inertia * delta.deltaMS);
                currentPosition = item.position.add(constantForceVector);
            }

            if (initialPosition.equals(currentPosition) === false) {
                item.position = currentPosition;

                // fast loose check
                const bodiesWithBoundingBoxContact = this.#bodies.filter((other) => other !== item && doBodiesOverlap(item, other));

                // more detailed check
                const raysWithBodyContact = new Map<PhysicsBody, RayCaster>();

                let staticContact: PhysicsBody | undefined;
                bodiesWithBoundingBoxContact.forEach((other) => {
                    if (item.constantForce) {
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
                    if (ray?.firstIntersection && item.constantForce) {
                        // hacky
                        // if (item.constantForce.x > 0 || item.constantForce.y > 0) {

                        const reverseVector = new Point(ray.firstIntersection.point).subtract(item.constantForce.add(ray.firstIntersection.point));
                        item.position = ray.firstIntersection.point.add(reverseVector);
                        console.log("hmssssada", reverseVector);
                        // } else {
                        //     item.position = ray.firstIntersection.point;
                        // }

                        // item.position = ray.firstIntersection.point;
                        // item.constantForce = new Point(Point.ZeroZero);
                        // console.log("safe", ray.firstIntersection.point, safePoint);
                    }

                    item.bodyEntered(staticContact);
                } else {
                    // pass through rigid object
                    raysWithBodyContact.forEach((_ray, other) => {
                        if (item.contacts.has(other) === false) {
                            item.contacts.add(other);
                            item.bodyEntered(other);
                        }
                    });

                    item.contacts.forEach((other) => {
                        if (bodiesWithBoundingBoxContact.includes(other) === false) {
                            item.contacts.delete(other);
                            item.bodyExited(other);
                        }
                    });
                }
            }
        });
    }
}
