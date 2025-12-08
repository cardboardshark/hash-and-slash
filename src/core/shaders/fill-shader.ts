import { Shader } from "@/core/shaders/shader";

interface ShaderOptions {
    fill?: string;
    stroke?: string;
}
export class FillShader extends Shader {
    fill;
    stroke;

    constructor({ fill, stroke }: ShaderOptions) {
        super();
        this.fill = fill;
        this.stroke = stroke;
    }

    apply(): string {
        throw new Error("Method not implemented.");
    }
}
