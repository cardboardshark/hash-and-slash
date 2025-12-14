import { Point } from "@/core/primitives/point";
import { BoundingBox, PhysicsBody } from "@/core/types/primitive-types";

let previousId = -1;
export abstract class RigidBody {
    id: number;
    vector = new Point(Point.ZeroZero);
    constantForce?: Point;
    inertia = 0;
    // constantTorque?: number;
    linearDamp?: number;
    position = new Point(Point.ZeroZero);
    abstract boundingBox: BoundingBox;
    contacts = new Set<PhysicsBody>();

    constructor() {
        this.id = previousId + 1;
        previousId += 1;
    }

    setConstantForce(vector: Point) {
        this.constantForce = vector;
    }
    // setConstantTorque(value: number) {
    //     this.constantTorque = value;
    // }

    applyImpulse(impulse: Point, position: Point) {}

    bodyEntered(other: PhysicsBody) {}

    bodyExited(other: PhysicsBody) {}
}
