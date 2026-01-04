import { CARDINAL_DIRECTION, CardinalDirection, INPUT } from "@/core/core-constants";
import { Node2d } from "@/core/primitives/node-2d";
import { RectangleShape } from "@/core/primitives/rectangle-shape";
import { PointLike, SpriteSheetOptions } from "@/core/types/primitive-types";
import { chunk } from "lodash";

export class RotatingSprite extends Node2d {
    index = 0;
    numFrames = 4;
    frames = {
        [INPUT.UP]: "",
        [INPUT.RIGHT]: "",
        [INPUT.DOWN]: "",
        [INPUT.LEFT]: "",
    };
    sprite;

    constructor(point: PointLike, options: SpriteSheetOptions) {
        super();
        this.sprite = new RectangleShape(point, options.width, options.height);
        this.index = options.initialIndex ?? 0;
        this.frames = this.#makeFrames(options.content ?? "");
        this.set(point);
    }

    #makeFrames(content: string) {
        const rows = content.split("\n");
        const dimensions = this.sprite.dimensions;
        const chunkedRows = chunk(rows, dimensions.height);

        return chunkedRows.reduce<Record<CardinalDirection, string>>((acc, rowOfRawFrames, index) => {
            const rowFrames = rowOfRawFrames.reduce<string[]>((frameAcc, line) => {
                const chunkedLines = chunk(Array.from(line), dimensions.width + 1);
                chunkedLines.forEach((line, index) => {
                    frameAcc[index] ??= "";
                    frameAcc[index] += `${line.join("")}\n`;
                });
                return frameAcc;
            }, []);
            acc[CARDINAL_DIRECTION[index]] = rowFrames.at(0) ?? "";
            return acc;
        }, this.frames);
    }

    setFrame(direction: CardinalDirection) {
        this.index = CARDINAL_DIRECTION.findIndex((d) => d === direction);
        return this;
    }

    get dimensions() {
        return this.sprite.dimensions;
    }

    get boundingBox() {
        return this.sprite.boundingBox;
    }

    draw() {
        const direction = CARDINAL_DIRECTION.at(this.index) ?? "up";
        this.sprite.background = { src: this.frames[direction] };
        return this.sprite.draw();
    }
}
