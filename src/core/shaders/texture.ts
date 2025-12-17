import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import { Shader } from "@/core/shaders/shader";
import { TextOptions, TextureOptions } from "@/core/types/primitive-types";
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

    apply(source: DrawBuffer) {
        const localGrid = new Text(Point.ZeroZero, this.src).draw();
        const offsetPoint = calculateRelativeOriginPoint(source.boundingBox, localGrid.boundingBox, this.position);

        if (this.fill) {
            source.fillRectangle(new Rectangle(Point.ZeroZero, source.boundingBox.width, source.boundingBox.height), this.fill);
        }

        source.merge(localGrid, { offset: offsetPoint, lockTransparentPixels: true });
        return source;
    }

    static applyFromOptions(buffer: DrawBuffer, options?: Texture | TextureOptions | string) {
        if (options instanceof Texture) {
            options.apply(buffer);
        }
        if (typeof options === "object") {
            new Texture(options).apply(buffer);
        }
        if (typeof options === "string") {
            new Texture({ src: options }).apply(buffer);
        }
        return buffer;
    }
}
