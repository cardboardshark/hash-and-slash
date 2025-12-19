import { PhysicsBody } from "@/core/physics/physic-body";
import { RigidBody } from "@/core/physics/rigid-body";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Line } from "@/core/primitives/line";
import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { IntersectingPixels } from "@/core/types/primitive-types";
import { TickerDelta } from "@/core/types/ticker-types";
import { doBodiesOverlap } from "@/core/utils/collision-util";

type ValidChildren = Node2d | Line | PolyLine;
const COLLISION_HULL_THICKNESS = 1;
interface BodyIntersection {
    other: PhysicsBody;
    intersections: IntersectingPixels[];
}
export class Scene extends Node2d {
    id = "scene";
    constantForce = new Point(Point.ZeroZero);

    #bodyRegistry = new Set<PhysicsBody>();

    // Wrap appendChild and removeChild to detect physics bodies
    appendChild(node: ValidChildren) {
        if (node instanceof PhysicsBody) {
            this.#bodyRegistry.add(node);
        }
        return super.appendChild(node);
    }
    removeChild(node: ValidChildren) {
        if (node instanceof PhysicsBody) {
            this.#bodyRegistry.delete(node);
        }
        return super.removeChild(node);
    }

    process(delta: TickerDelta) {
        const allBodies = Array.from(this.#bodyRegistry);
        const rigidBodies = allBodies.filter((b) => b instanceof RigidBody);
        rigidBodies.forEach((body) => {
            let initialPosition = body.precisePosition.clone();
            let currentPosition = body.precisePosition.clone();

            if (body instanceof RigidBody) {
                currentPosition = currentPosition.add(new Point(this.constantForce).multiplyScalar(delta.deltaMS));
                currentPosition = currentPosition.add(new Point(body.constantForce).multiplyScalar(delta.deltaMS));
                currentPosition = currentPosition.add(new Point(body.linearVelocity).multiplyScalar(delta.deltaMS));

                if (new Point(body.linearVelocity).roughlyEquals(Point.ZeroZero)) {
                    body.linearVelocity = new Point(Point.ZeroZero);
                } else if (body.linearDamp > 0) {
                    const magnitude = new Point(body.linearVelocity).magnitude() - body.linearDamp * delta.deltaMS;
                    body.linearVelocity = new Point(body.linearVelocity).normalize().multiplyScalar(magnitude);
                }
            }

            if (initialPosition.equals(currentPosition) === false) {
                body.set(currentPosition);

                // fast loose check
                const nearbyBodies = allBodies.filter((other) => other !== body && doBodiesOverlap(body, other, COLLISION_HULL_THICKNESS));

                const intersectingBodies = nearbyBodies.reduce<BodyIntersection[]>((acc, other) => {
                    // laughably ineffecient
                    const intersections = DrawBuffer.intersect(
                        { buffer: body.draw(), offset: body.originPosition },
                        { buffer: other.draw(), offset: other.originPosition }
                    );

                    if (intersections.length > 0) {
                        acc.push({ other, intersections });
                    }

                    return acc;
                }, []);

                intersectingBodies.forEach(({ other, intersections }) => {
                    if (body.contacts.has(other) === false) {
                        body.contacts.add(other);
                        body._bodyEntered(other, intersections);
                    }
                });

                // Find persistent contacts
                const initialContacts = Array.from(body.contacts).filter((o) => {
                    return intersectingBodies.find((row) => row.other === o) === undefined;
                });
                initialContacts.forEach((other) => {
                    // laughably ineffecient
                    const intersections = DrawBuffer.intersect(
                        { buffer: body.draw(), offset: body.originPosition },
                        { buffer: other.draw(), offset: other.originPosition }
                    );

                    if (intersections.length > 0) {
                        body._bodyContact(other, intersections);
                    } else {
                        body.contacts.delete(other);
                        body._bodyExited(other);
                    }
                });

                /*
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
                }*/
            }
        });
    }
}
