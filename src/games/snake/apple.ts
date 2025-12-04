import { Point } from "@/core/primitives/point";
import type { PolyLine } from "@/core/primitives/poly-line";
import type { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import type { PointLike, RenderableEntity } from "@/core/types";
import type { Player } from "@/games/snake/player";
import { random } from "lodash";

export class Apple implements RenderableEntity {
    numCollected: number = 0;
    position;

    constructor(initialPosition: PointLike) {
        this.position = initialPosition;
    }

    canPlayerClaimApple(player: Player) {
        return player.position.equals(this.position);
    }

    claimApple() {
        this.numCollected += 1;
    }

    generateApple(liveArea: Rectangle, playerPath: PolyLine) {
        const liveAreaPoints = [];
        console.log();
        for (let y = liveArea.topLeft.y + 1; y < liveArea.bottomRight.y - 1; y += 1) {
            for (let x = liveArea.topLeft.x + 1; x < liveArea.bottomRight.x - 1; x += 1) {
                liveAreaPoints.push({ x, y });
            }
        }

        const filledSpaces = new Set<string>(playerPath.lines.flatMap((l) => l.toPoints().map((p) => `${p.x},${p.y}`)));
        const validSpaces = liveAreaPoints.filter((p) => filledSpaces.has(`${p.x},${p.y}`) === false);
        this.position = new Point(validSpaces[random(0, validSpaces.length - 1)]);
        console.log(this.position);
    }

    toRenderable() {
        return new Sprite(this.position, "ó");
    }
}
