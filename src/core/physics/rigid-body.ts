import { PhysicsBody } from "@/core/physics/physic-body";
import { Point } from "@/core/primitives/point";

let previousId = -1;
export class RigidBody extends PhysicsBody {
    rid: number;
    vector = new Point(Point.ZeroZero);
    constantForce?: Point;
    inertia = 0;
    // constantTorque?: number;
    linearDamp?: number;
    contacts = new Set<PhysicsBody>();

    constructor() {
        super();
        this.rid = previousId + 1;
        previousId += 1;
    }

    setConstantForce(vector: Point) {
        this.constantForce = vector;
    }
    // setConstantTorque(value: number) {
    //     this.constantTorque = value;
    // }

    applyImpulse(impulse: Point, position: Point) {}
}
