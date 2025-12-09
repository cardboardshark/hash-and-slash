import { PixelGrid } from "@/core/pipeline/pixel-grid";

/**
 * We're being incredibly generous with this terminology
 */
export abstract class Shader {
    constructor() {}
    abstract apply(grid: PixelGrid): PixelGrid;
}
