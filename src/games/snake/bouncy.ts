import { RigidBody } from "@/core/physics/rigid-body";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";

export class Bouncy extends RigidBody {
    inertia = 2;

    constructor() {
        super();
        const rect = new Rectangle(Point.ZeroZero, 2, 2);
        rect.background = "▟▙\n▜▛";

        this.appendChild(rect);
    }
}
