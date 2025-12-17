import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";

let previousId = -1;
export abstract class StaticBody extends Node2d {
    sid: number;

    position = new Point(Point.ZeroZero);

    constructor() {
        super();
        this.sid = previousId + 1;
        previousId += 1;
    }
}
