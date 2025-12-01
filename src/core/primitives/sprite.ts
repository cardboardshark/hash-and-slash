import type { PointLike } from "@/core/types";

export class Sprite {
    x;
    y;
    content;

    constructor(point: PointLike, content: string | number) {
        this.x = point.x;
        this.y = point.y;
        this.content = content;
    }
}
