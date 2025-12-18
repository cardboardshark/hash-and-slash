import { Node2d } from "@/core/primitives/node-2d";
import { Rectangle } from "@/core/primitives/rectangle";
import { PointLike, PointLikeFn, SpriteSheetOptions } from "@/core/types/primitive-types";
import { chunk } from "lodash";

export class Sprite extends Node2d {
    index = 0;
    width = 0;
    height = 0;
    numFrames = 0;
    frames: string[] = [];
    rect;
    rotate?: number;

    constructor(point: PointLike | PointLikeFn, options: string | SpriteSheetOptions) {
        super();
        if (typeof options === "object") {
            const { content, initialIndex = 0, width, height, numFrames } = options ?? {};
            this.index = initialIndex;
            this.width = width;
            this.height = height;
            this.numFrames = numFrames;
            this.frames = this.#makeFrames(content);
        } else {
            const rows = options.split("\n");
            const longestRow = rows.reduce((max, line) => {
                if (line.length > max) {
                    max = line.length;
                }
                return max;
            }, 0);

            this.width = longestRow;
            this.height = rows.length;
            this.frames = this.#makeFrames(options);
        }

        this.set(point);
        this.rect = new Rectangle(point, this.width, this.height);
    }

    #makeFrames(content: string) {
        const rows = content.split("\n");
        const chunkedRows = chunk(rows, this.height);
        return chunkedRows.reduce<string[]>((acc, rowOfRawFrames) => {
            const rowFrames = rowOfRawFrames.reduce<string[]>((frameAcc, line) => {
                const chunkedLines = chunk(Array.from(line), this.width + 1);
                chunkedLines.forEach((line, index) => {
                    frameAcc[index] ??= "";
                    frameAcc[index] += `${line.join("")}\n`;
                });
                return frameAcc;
            }, []);
            acc.push(...rowFrames);
            return acc;
        }, []);
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

    get boundingBox() {
        return this.rect.boundingBox;
    }

    draw() {
        const currentIndex = Math.floor(this.index) % this.numFrames;
        this.rect.background = { src: this.frames.at(currentIndex) ?? "error" };
        this.rect.rotate = this.rotate;
        return this.rect.draw();
    }
}
