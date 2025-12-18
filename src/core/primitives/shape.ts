import { Node2d } from "@/core/primitives/node-2d";
import { Background } from "@/core/shaders/background";
import { Shader } from "@/core/shaders/shader";
import { BackgroundOptions } from "@/core/types/primitive-types";

export abstract class Shape extends Node2d {
    background?: string | number | Background | BackgroundOptions;
    shaders: Shader[] = [];
    rotate?: number;

    collision?: {
        type: "static" | "rigid";
        body: Shape;
    };
    _debug: boolean = false;
}
