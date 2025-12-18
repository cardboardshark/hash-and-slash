import { RigidBody } from "@/core/physics/rigid-body";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";

export class Ball extends RigidBody {
    linearDamp = 0.3;

    constructor() {
        super();

        const rect = new Rectangle(Point.ZeroZero, 2, 2);
        rect.background = { fill: "B" };
        this.appendChild(rect);
    }
}
