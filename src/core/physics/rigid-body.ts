import { Point } from "@/core/geometry/point";
import { PhysicsBody } from "@/core/physics/physic-body";

let previousId = -1;
export class RigidBody extends PhysicsBody {
    rid: number;
    constantForce = new Point(Point.ZeroZero);
    linearVelocity = new Point(Point.ZeroZero);
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

    setConstantForce(velocity: Point) {
        this.constantForce = velocity;
    }
    // setConstantTorque(value: number) {
    //     this.constantTorque = value;
    // }

    // applyImpulse(impulse: Point, position: Point) {}
}
