import { Buffer } from "@/core/pipeline/buffer";
import { Point } from "@/core/primitives/point";
import { Shader } from "@/core/shaders/shader";
import { Texture } from "@/core/shaders/texture";
import { BoundingBox, TextureOptions } from "@/core/types/primitive-types";
import { lerp } from "@/core/utils/math-utils";
import { parsePositionString } from "@/core/utils/string-util";

export abstract class Shape {
    x = 0;
    y = 0;
    abstract boundingBox: BoundingBox;
    // defaults to top-left of element
    origin?: string;
    fill: number | string | null = "?";
    texture?: string | TextureOptions | Texture;
    _debug: boolean = false;

    get point() {
        return new Point(this.x, this.y);
    }

    get originPoint() {
        if (this.origin == undefined) {
            return this.point;
        }

        const dimensions = this.boundingBox;
        const originOffset = parsePositionString(this.origin);
        let offsetX = 0;
        let offsetY = 0;

        // hacky
        if (originOffset.x.is_percent) {
            offsetX = lerp(0, (dimensions.width - 1) * -1, originOffset.x.value);
        } else {
            offsetX = originOffset.x.value;
        }
        if (originOffset.y.is_percent) {
            offsetY = lerp(0, (dimensions.height - 1) * -1, originOffset.y.value);
        } else {
            offsetY = originOffset.y.value;
        }

        return this.point.add(new Point(offsetX, offsetY));
    }

    setOrigin(value?: string) {
        this.origin = value;
        return this;
    }

    abstract toBuffer(): Buffer;

    shaders: Shader[] = [];
}
