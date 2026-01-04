import { Rectangle } from "@/core/geometry/rectangle";
import { StaticBody } from "@/core/physics/static-body";
import { RectangleShape } from "@/core/primitives/rectangle-shape";
import { AssetUtil } from "@/core/utils/asset-util";

export class Wall extends StaticBody {
    shape;

    constructor(rect: Rectangle) {
        super();
        this.shape = RectangleShape.from(rect);
        this.shape.background = AssetUtil.load("wall");
        this.set(rect.position);
    }

    draw() {
        return this.shape.draw();
    }

    get boundingBox() {
        return this.shape.boundingBox;
    }
}
