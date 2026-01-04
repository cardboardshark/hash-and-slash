import { Node2d } from "@/core/primitives/node-2d";
import { BoundingBox, Dimensions } from "@/core/types/primitive-types";

export abstract class Node2dGeometry extends Node2d {
    abstract shape: {
        dimensions: Dimensions;
        boundingBox: BoundingBox;
    };

    get dimensions() {
        return this.shape.dimensions;
    }

    get boundingBox() {
        return this.shape.boundingBox;
    }
}
