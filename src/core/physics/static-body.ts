import { Point } from "@/core/primitives/point";
import { BoundingBox } from "@/core/types/primitive-types";

let previousId = -1;
export abstract class StaticBody {
    id: number;

    position = new Point(Point.ZeroZero);
    abstract boundingBox: BoundingBox;

    constructor() {
        this.id = previousId + 1;
        previousId += 1;
    }
}
