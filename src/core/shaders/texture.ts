import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Point } from "@/core/primitives/point";
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

    apply(source: PixelGrid) {
        const localGrid = new Text(Point.ZeroZero, this.src).toPixels();
        const offsetPoint = calculateRelativeOriginPoint(source.boundingBox, localGrid.boundingBox, this.position);

        if (this.fill) {
            source.fill(source.boundingBox.width, source.boundingBox.height, this.fill);
        }

        source.strictMerge(localGrid, offsetPoint);
        return source;
    }
}
