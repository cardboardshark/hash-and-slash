import { StaticBody } from "@/core/physics/static-body";
import { Rectangle } from "@/core/primitives/rectangle";
import { AssetUtil } from "@/core/utils/asset-util";

export class Wall extends StaticBody {
    rect;

    constructor(rect: Rectangle) {
        super();
        this.rect = rect;
        this.rect.texture = AssetUtil.load("snake/wall");
        this.position = rect.position;
    }

    draw() {
        return this.rect.draw();
    }

    get boundingBox() {
        return this.rect.boundingBox;
    }
}
