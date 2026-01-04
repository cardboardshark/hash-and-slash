import { Point } from "@/core/geometry/point";
import { RigidBody } from "@/core/physics/rigid-body";
import { RectangleShape } from "@/core/primitives/rectangle-shape";

export class Bouncy extends RigidBody {
    inertia = 2;

    constructor() {
        super();
        const rect = new RectangleShape(Point.ZeroZero, 2, 2);
        rect.background = "▟▙\n▜▛";

        this.appendChild(rect);
    }
}
