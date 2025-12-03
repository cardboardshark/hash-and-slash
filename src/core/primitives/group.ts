import { type PointLike, type ShapeLike, type SpriteLike } from "@/core/types";
import { Sprite } from "./sprite";

export class Group {
    items;
    x;
    y;

    constructor(point: PointLike, initial: (SpriteLike | ShapeLike | Set<SpriteLike | ShapeLike>)[] = []) {
        this.x = point.x;
        this.y = point.y;

        this.items = new Set<Sprite | ShapeLike | Set<SpriteLike | ShapeLike>>(initial);
    }

    add(value: Sprite | ShapeLike | Set<SpriteLike | ShapeLike>) {
        this.items.add(value);
    }
}
