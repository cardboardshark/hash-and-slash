import { CARDINAL_DIRECTION, CardinalDirection, INPUT } from "@/core/core-constants";
import { Node2d } from "@/core/primitives/node-2d";
import { Rectangle } from "@/core/primitives/rectangle";
import { PointLike, SpriteSheetOptions } from "@/core/types/primitive-types";
import { chunk } from "lodash";

export class RotatingSprite extends Node2d {
    index = 0;
    width = 0;
    height = 0;
    numFrames = 4;
    frames = {
        [INPUT.UP]: "",
        [INPUT.RIGHT]: "",
        [INPUT.DOWN]: "",
        [INPUT.LEFT]: "",
    };
    rect;

    constructor(point: PointLike, options: SpriteSheetOptions) {
        super();
        const { content, initialIndex = 0, width, height } = options ?? {};
        this.index = initialIndex;
        this.width = width;
        this.height = height;
        this.frames = this.#makeFrames(content);
        this.set(point);
        this.rect = new Rectangle(point, this.width, this.height);
    }

    #makeFrames(content: string) {
        const rows = content.split("\n");
        const chunkedRows = chunk(rows, this.height);

        return chunkedRows.reduce<Record<CardinalDirection, string>>((acc, rowOfRawFrames, index) => {
            const rowFrames = rowOfRawFrames.reduce<string[]>((frameAcc, line) => {
                const chunkedLines = chunk(Array.from(line), this.width + 1);
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

    get boundingBox() {
        return this.rect.boundingBox;
    }

    draw() {
        const direction = CARDINAL_DIRECTION.at(this.index) ?? "up";
        this.rect.background = { src: this.frames[direction] };
        return this.rect.draw();
    }
}
