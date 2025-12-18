import { PhysicsBody } from "@/core/physics/physic-body";
import { Point } from "@/core/primitives/point";
import { Velocity } from "@/core/types/primitive-types";

let previousId = -1;
export class RigidBody extends PhysicsBody {
    rid: number;
    constantForce: Velocity = Point.ZeroZero;
    linearVelocity: Velocity = Point.ZeroZero;
    linearDamp = 0;

    // rotational mass
    inertia = 0;
    // constantTorque?: number;
    contacts = new Set<PhysicsBody>();

    constructor() {
        super();
        this.rid = previousId + 1;
        previousId += 1;
    }

    setConstantForce(velocity: Velocity) {
        this.constantForce = velocity;
    }
    // setConstantTorque(value: number) {
    //     this.constantTorque = value;
    // }

    applyImpulse(impulse: Point, position: Point) {}
}
