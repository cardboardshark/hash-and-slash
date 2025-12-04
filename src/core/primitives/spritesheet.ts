import { Sprite } from "@/core/primitives/sprite";
import type { PointLike, RenderableEntity } from "@/core/types";
import { chunk } from "lodash";

interface SpriteSheetOptions {
    content: string;
    numFrames: number;
    frameWidth: number;
    frameHeight: number;
    initialIndex?: number;
}

export class SpriteSheet implements RenderableEntity {
    point;
    index;
    content;
    frameWidth: number;
    frameHeight: number;
    numFrames: number;

    constructor(point: PointLike, { content, initialIndex = 0, frameWidth, frameHeight, numFrames }: SpriteSheetOptions) {
        this.point = point;
        this.index = initialIndex;
        this.content = content;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.numFrames = numFrames;
    }

    previous() {
        this.index = (this.index - 1) % this.numFrames;
    }
    next() {
        this.index = (this.index + 1) % this.numFrames;
    }
    setFrame(value: number) {
        this.index = value % this.numFrames;
    }

    toRenderable() {
        const rows = this.content.split("\n");
        const chunkedRows = chunk(rows, this.frameHeight);
        const frames = chunkedRows.reduce<string[]>((acc, rowOfRawFrames) => {
            const rowFrames = rowOfRawFrames.reduce<string[]>((frameAcc, line) => {
                const chunkedLines = chunk(Array.from(line), this.frameWidth + 1);
                chunkedLines.forEach((line, index) => {
                    frameAcc[index] ??= "";
                    frameAcc[index] += `${line.join("")}\n`;
                });
                return frameAcc;
            }, []);
            acc.push(...rowFrames);
            return acc;
        }, []);

        return new Sprite(this.point, frames.at(this.index) ?? "error");
    }
}
