import { StaticBody } from "@/core/physics/static-body";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { AssetUtil } from "@/core/utils/asset-util";
import { random } from "lodash";

export class Apple extends StaticBody {
    constructor() {
        super();
        this.appendChild(new Sprite(Point.ZeroZero, AssetUtil.load("apple")));
    }

    placeNewApple(liveArea: Rectangle) {
        const liveAreaPoints = [];
        for (let y = liveArea.boundingBox.top + 1; y < liveArea.boundingBox.bottom - 3; y += 1) {
            for (let x = liveArea.boundingBox.left + 1; x < liveArea.boundingBox.right - 3; x += 1) {
                liveAreaPoints.push({ x, y });
            }
        }

        this.set(new Point(liveAreaPoints[random(0, liveAreaPoints.length - 1)]));
        console.log("Moving apple to", this.position);
        return this;
    }
}
