import { Point } from "@/core/geometry/point";
import { Rectangle } from "@/core/geometry/rectangle";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Text } from "@/core/primitives/text";
import { Shader } from "@/core/shaders/shader";
import { BackgroundOptions } from "@/core/types/primitive-types";
import { calculateRelativeOriginPoint } from "@/core/utils/geometry-util";

export class Background extends Shader {
    src;
    position;
    fill;

    constructor({ src, position, fill }: BackgroundOptions) {
        super();
        this.fill = fill !== null && fill !== undefined ? String(fill).substring(0, 1) : null;
        this.src = src;
        this.position = position;
    }

    apply(source: DrawBuffer) {
        if (this.fill) {
            source.fillRectangle(
                new Rectangle(new Point(source.boundingBox.left, source.boundingBox.top), source.boundingBox.width + 1, source.boundingBox.height + 1),
                this.fill
            );
        }

        if (this.src !== undefined) {
            const localGrid = new Text(Point.ZeroZero, this.src).draw();
            const offsetPoint = calculateRelativeOriginPoint(source.boundingBox, localGrid.boundingBox, this.position);
            source.merge(localGrid, { offset: offsetPoint, lockTransparentPixels: true });
        }

        return source;
    }

    static apply(buffer: DrawBuffer, options?: string | number | Background | BackgroundOptions) {
        if (options instanceof Background) {
            options.apply(buffer);
        }
        if (typeof options === "object") {
            new Background(options).apply(buffer);
        }
        if (typeof options === "string" || typeof options === "number") {
            new Background({ src: options }).apply(buffer);
        }
        return buffer;
    }
}
