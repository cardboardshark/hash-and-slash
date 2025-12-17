import { Point } from "@/core/primitives/point";
import { BoundingBox, PhysicsBody } from "@/core/types/primitive-types";

let previousId = -1;
export class RigidBody {
    id: number;
    vector = new Point(Point.ZeroZero);
    constantForce?: Point;
    inertia = 0;
    // constantTorque?: number;
    linearDamp?: number;
    contacts = new Set<PhysicsBody>();
    boundingBoxRef?: BoundingBox;

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

    setBoundingBox(box: BoundingBox) {
        this.boundingBoxRef = box;
    }

    get boundingBox() {
        if (this.boundingBoxRef === undefined) {
            throw new Error("RigidBody does not have defined BoundingBox");
        }
        return this.boundingBoxRef;
    }

    applyImpulse(impulse: Point, position: Point) {}

    bodyEntered(other: PhysicsBody) {}

    bodyExited(other: PhysicsBody) {}
}
