import { BLANK_CHARACTER } from "@/core/core-constants";
import { Rectangle } from "@/core/primitives/rectangle";
import { PointLike, RenderableEntity } from "@/core/types/primitive-types";
import { chunk } from "lodash";

interface SpriteSheetOptions {
    content: string;
    numFrames: number;
    frameWidth: number;
    frameHeight: number;
    initialIndex?: number;
}

export class Sprite implements RenderableEntity {
    position;
    index;
    content;
    frameWidth: number;
    frameHeight: number;
    numFrames: number;

    constructor(point: PointLike, { content, initialIndex = 0, frameWidth, frameHeight, numFrames }: SpriteSheetOptions) {
        this.position = point;
        this.index = initialIndex;
        this.content = content;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.numFrames = numFrames;
    }

    previous(increment = 1) {
        this.next(increment * -1);
    }
    next(increment = 1) {
        this.index += increment;
        if (this.index > this.numFrames) {
            this.index = 0;
        }
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

        const currentIndex = Math.floor(this.index) % this.numFrames;

        const rect = new Rectangle(this.position, this.frameWidth, this.frameHeight);
        rect.texture = { src: frames.at(currentIndex) ?? "error", fill: BLANK_CHARACTER };
        return rect;
    }
}
