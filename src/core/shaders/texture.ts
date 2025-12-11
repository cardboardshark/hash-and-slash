import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Point } from "@/core/primitives/point";
import { Text } from "@/core/primitives/text";
import { Shader } from "@/core/shaders/shader";
import { PointLike, TextureOptions } from "@/core/types/primitive-types";
import { calculateBoundingBoxFromPoints } from "@/core/utils/geometry-util";
import { parsePositionString } from "@/core/utils/shader-util";

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
        let offsetX = 0;
        let offsetY = 0;

        if (this.position) {
            const offset = parsePositionString(this.position);

            if (offset.x.is_percent) {
                offsetX = source.boundingBox.width * offset.x.value - localGrid.boundingBox.width * offset.x.value;
            } else {
                offsetX = offset.x.value;
            }
            if (offset.y.is_percent) {
                offsetY = source.boundingBox.height * offset.y.value - localGrid.boundingBox.height * offset.y.value;
            } else {
                offsetY = offset.y.value;
            }
        }

        if (this.fill) {
            source.fill(source.boundingBox.width, source.boundingBox.height, this.fill);
        }

        source.strictMerge(localGrid, new Point(offsetX, offsetY));
        return source;
    }
}
