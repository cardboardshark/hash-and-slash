import { Point } from "@/core/primitives/point";
import { isPointLike, isSpriteLike, type PointLike, type SpriteLike } from "@/core/types";

export class Sprite implements SpriteLike {
    x;
    y;
    content;

    constructor(sprite: SpriteLike);
    constructor(point: PointLike, content: string | number);
    constructor(pointOrSprite: PointLike | SpriteLike, content?: string | number) {
        if (isSpriteLike(pointOrSprite)) {
            this.x = pointOrSprite.x;
            this.y = pointOrSprite.y;
            this.content = pointOrSprite.content;
        } else if (content !== undefined) {
            this.x = pointOrSprite.x;
            this.y = pointOrSprite.y;
            this.content = content;
        } else {
            throw new Error("Invalid arguments passed to Sprite");
        }
    }

    get point() {
        return new Point(this.x, this.y);
    }

    set(point: PointLike): this;
    set(x: number, y: number): this;
    set(xOrPoint: number | PointLike, y?: number) {
        if (isPointLike(xOrPoint)) {
            this.x = xOrPoint.x;
            this.y = xOrPoint.y;
        } else if (y !== undefined) {
            this.x = xOrPoint;
            this.y = y;
        }
        return this;
    }
}
