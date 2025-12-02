import { isLineLike, isPolygonLike, isRectangleLike, isSpriteLike, type PaintOptions, type ShapeLike, type SpriteLike } from "@/core/types";
import { Sprite } from "./sprite";
import { Polygon } from "@/core/primitives/polygon";
import { Rectangle } from "@/core/primitives/rectangle";
import { Line } from "@/core/primitives/line";

type PaintedSprites =
    | Sprite
    | {
          shape: ShapeLike;
          paint?: PaintOptions;
      };
export class CanvasBuffer {
    items;

    constructor(initial: Sprite[] | ShapeLike[] = []) {
        this.items = new Set<PaintedSprites>();
        this.push(initial);
    }

    push(value: Sprite | Sprite[] | ShapeLike | ShapeLike[] | CanvasBuffer, paint?: PaintOptions) {
        let valueAsArray = [];
        if (value instanceof CanvasBuffer) {
            valueAsArray = Array.from(value.items);
            return;
        }

        if (Array.isArray(value)) {
            valueAsArray = value;
        } else {
            valueAsArray = [value];
        }

        valueAsArray.forEach((row) => {
            if (row instanceof Sprite) {
                this.items.add(row);
                return;
            }
            this.items.add({ shape: row, paint });
        });
    }

    get sprites() {
        return Array.from(this.items).reduce<Sprite[]>((acc, row) => {
            if (isSpriteLike(row)) {
                if (row instanceof Sprite) {
                    acc.push(row);
                } else {
                    acc.push(new Sprite(row));
                }
            } else if (isPolygonLike(row.shape) && row.shape instanceof Polygon === false) {
                const shapeAsSprite = new Polygon(row.shape).toSprite(row.paint);
                if (Array.isArray(shapeAsSprite)) {
                    acc.push(...shapeAsSprite);
                } else {
                    acc.push(shapeAsSprite);
                }
            } else if (isRectangleLike(row.shape) && row.shape instanceof Rectangle === false) {
                acc.push(new Rectangle(row.shape).toSprite(row.paint));
            } else if (isLineLike(row.shape) && row.shape instanceof Rectangle === false) {
                acc.push(...new Line(row.shape).toSprite(row.paint));
            } else {
                const shapeAsSprite = row.shape.toSprite(row.paint);
                if (Array.isArray(shapeAsSprite)) {
                    acc.push(...shapeAsSprite);
                } else {
                    acc.push(shapeAsSprite);
                }
            }
            return acc;
        }, []);
    }
}
