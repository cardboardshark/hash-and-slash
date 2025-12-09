import { PixelGrid } from "@/core/pipeline/pixel-grid";
import { Point } from "@/core/primitives/point";
import { Text } from "@/core/primitives/text";
import { Shader } from "@/core/shaders/shader";

interface TextureOptions {
    asset: string;
}
export class Texture extends Shader {
    asset;

    constructor({ asset }: TextureOptions) {
        super();
        this.asset = asset;
    }

    apply(grid: PixelGrid) {
        const localGrid = new Text(Point.ZeroZero, this.asset).toPixels();
        grid.strictMerge(localGrid);
        return grid;
    }
}
