import { Buffer } from "@/core/pipeline/buffer";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import { Shader } from "@/core/shaders/shader";
import { TextureOptions } from "@/core/types/primitive-types";
import { calculateRelativeOriginPoint } from "@/core/utils/geometry-util";

export class Texture extends Shader {
    src;
    position;
    fill;

    constructor({ src, position, fill }: TextureOptions) {
        super();
        this.fill = fill;
        this.src = src;
        this.position = position;
    }

    apply(source: Buffer) {
        const localGrid = new Text(Point.ZeroZero, this.src).toBuffer();
        const offsetPoint = calculateRelativeOriginPoint(source.boundingBox, localGrid.boundingBox, this.position);

        if (this.fill) {
            source.fillRectangle(new Rectangle(Point.ZeroZero, source.boundingBox.width, source.boundingBox.height), this.fill);
        }

        source.merge(localGrid, { offset: offsetPoint, lockTransparentPixels: true });
        return source;
    }
}
