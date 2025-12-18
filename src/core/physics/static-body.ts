import { PhysicsBody } from "@/core/physics/physic-body";

let previousId = -1;
export abstract class StaticBody extends PhysicsBody {
    sid: number;

    constructor() {
        super();
        this.sid = previousId + 1;
        previousId += 1;
    }
}
