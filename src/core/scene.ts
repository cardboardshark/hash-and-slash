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
                const bodiesWithRayContact = bodiesWithBoundingBoxContact.filter((other) => {
                    if (item.constantForce) {
                        const travelRay = new Line(initialPosition, currentPosition);
                        // collusion hull is slightly larger than bounding box
                        const otherRect = new Rectangle(
                            other.position.subtract(new Point(COLLISION_HULL_THICKNESS, COLLISION_HULL_THICKNESS)),
                            other.boundingBox.width + COLLISION_HULL_THICKNESS,
                            other.boundingBox.height + COLLISION_HULL_THICKNESS
                        );
                        const travelIntersection = new RayCaster(travelRay, otherRect);
                        return travelIntersection.hasIntersection;
                    }

                    return false;
                });

                const staticContact = bodiesWithRayContact.find((other) => other instanceof StaticBody);

                if (staticContact) {
                    // bounce off solid object
                    const travelRay = new Line(initialPosition, currentPosition);

                    // collusion hull is slightly larger than bounding box
                    const otherRect = new Rectangle(
                        staticContact.position.subtract(new Point(COLLISION_HULL_THICKNESS, COLLISION_HULL_THICKNESS)),
                        staticContact.boundingBox.width + COLLISION_HULL_THICKNESS,
                        staticContact.boundingBox.height + COLLISION_HULL_THICKNESS
                    );
                    const travelIntersection = new RayCaster(travelRay, otherRect);

                    if (travelIntersection.firstIntersection && item.constantForce) {
                        const safePoint = new Point(travelIntersection.firstIntersection.point).subtract(item.constantForce);
                        item.position = safePoint;
                        console.log("safe", safePoint);
                    }

                    item.bodyEntered(staticContact);
                } else {
                    // pass through rigid object
                    bodiesWithRayContact.forEach((other) => {
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
