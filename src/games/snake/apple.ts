import { StaticBody } from "@/core/physics/static-body";
import { Point } from "@/core/primitives/point";
import type { PolyLine } from "@/core/primitives/poly-line";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import type { BoundingBox, PointLike } from "@/core/types/primitive-types";
import { AssetUtil } from "@/core/utils/asset-util";
import type { Player } from "@/games/snake/player";
import { random } from "lodash";

export class Apple extends StaticBody {
    numCollected: number = 0;
    sprite;

    constructor(point: PointLike) {
        super();
        this.set(point);
        this.sprite = new Sprite(() => this.position, AssetUtil.load("/snake/apple"));
    }

    canPlayerClaimApple(player: Player) {
        return player.position.roughlyEquals(this.position);
    }

    claimApple() {
        this.numCollected += 1;
    }

    generateApple(liveArea: Rectangle, playerPath: PolyLine) {
        const liveAreaPoints = [];
        for (let y = liveArea.boundingBox.top + 1; y < liveArea.boundingBox.bottom - 1; y += 1) {
            for (let x = liveArea.boundingBox.left + 1; x < liveArea.boundingBox.right - 1; x += 1) {
                liveAreaPoints.push({ x, y });
            }
        }

        const filledSpaces = new Set<string>(playerPath.lines.flatMap((l) => l.toPoints().map((p) => `${p.x},${p.y}`)));
        const validSpaces = liveAreaPoints.filter((p) => filledSpaces.has(`${p.x},${p.y}`) === false);
        this.position = new Point(validSpaces[random(0, validSpaces.length - 1)]);
        console.log("Moving apple to", this.position);
    }

    get boundingBox() {
        return this.sprite.boundingBox;
    }

    draw() {
        return this.sprite.draw();
    }
}
