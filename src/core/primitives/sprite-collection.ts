import type { Sprite } from "./sprite";

export class SpriteCollection {
    sprites: Sprite[] = [];

    constructor(initialSprites = []) {
        this.sprites = initialSprites;
    }
    add(value: Sprite | Sprite[] | SpriteCollection) {
        if (value instanceof SpriteCollection) {
            this.sprites = [...this.sprites, ...value.sprites];
            return;
        }

        if (Array.isArray(value)) {
            this.sprites = [...this.sprites, ...value];
            return;
        }

        this.sprites.push(value);
    }

    push = this.add;
}
