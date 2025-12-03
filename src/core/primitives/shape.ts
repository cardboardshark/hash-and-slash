import type { BoundingBox } from "@/core/types";

export abstract class Shape {
    fill?: string;
    stroke?: string;
    abstract boundingBox: BoundingBox;
}
