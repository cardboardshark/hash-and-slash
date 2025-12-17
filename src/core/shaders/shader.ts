import { DrawBuffer } from "@/core/pipeline/draw-buffer";

/**
 * We're being incredibly generous with this terminology
 */
export abstract class Shader {
    constructor() {}
    abstract apply(buffer: DrawBuffer): DrawBuffer;
}
