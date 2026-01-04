import { Point } from "@/core/geometry/point";
import { RigidBody } from "@/core/physics/rigid-body";
import { RectangleShape } from "@/core/primitives/rectangle-shape";

export class Ball extends RigidBody {
    linearDamp = 0.3;

    constructor() {
        super();

        const rect = new RectangleShape(Point.ZeroZero, 2, 2);
        rect.background = { fill: "B" };
        this.appendChild(rect);
    }
}
