import { Buffer } from "@/core/pipeline/buffer";

/**
 * We're being incredibly generous with this terminology
 */
export abstract class Shader {
    constructor() {}
    abstract apply(buffer: Buffer): Buffer;
}
