import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Point } from "@/core/primitives/point";
import { Shader } from "@/core/shaders/shader";
import { Texture } from "@/core/shaders/texture";
import { BoundingBox, PointLike, TextureOptions } from "@/core/types/primitive-types";

export abstract class Shape {
    x = 0;
    y = 0;
    abstract boundingBox: BoundingBox;
    // defaults to top-left of element
    origin: number | string | PointLike = 0;
    fill: number | string | null = "?";
    texture?: string | TextureOptions | Texture;

    get point() {
        return new Point(this.x, this.y);
    }

    abstract toPixels(): PixelGrid;

    shaders: Shader[] = [];
}
