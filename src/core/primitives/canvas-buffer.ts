import { type ShapeLike } from "@/core/types";
import { Sprite } from "./sprite";

export class CanvasBuffer {
    items;

    constructor(initial: Sprite[] | ShapeLike[] = []) {
        this.items = new Set<Sprite | ShapeLike>();
        this.push(initial);
    }

    push(value: Sprite | Sprite[] | ShapeLike | ShapeLike[] | CanvasBuffer) {
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

        valueAsArray.forEach((shapeOrSprite) => {
            if (shapeOrSprite instanceof Sprite) {
                this.items.add(shapeOrSprite);
                return;
            }
            this.items.add(shapeOrSprite);
        });
    }
}
