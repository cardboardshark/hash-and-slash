import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import type { PointLike, RenderableEntity } from "@/core/types";
import type { Player } from "@/games/snake/player";

export class Trail implements RenderableEntity {
    points: PointLike[] = [];
    maxLength;
    owner;
    previousVector?: PointLike;

    constructor(owner: Player, maxLength: number) {
        this.owner = owner;
        this.maxLength = maxLength;
    }

    setMaxLength(value: number) {
        this.maxLength = value;
    }

    tick(delta: number) {
        if (new Point(this.owner.vector).equals(this.previousVector) === false) {
            this.points.unshift(this.owner.previousPosition);
        }
        this.previousVector = this.owner.vector;
    }

    toRenderable() {
        const line = new PolyLine([this.owner.position, ...this.points]);
        line.stroke = "-";
        return line;
    }
}
