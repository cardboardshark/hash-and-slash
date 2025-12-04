import type { KeyboardController } from "@/core/keyboard-controller";
import { Point } from "@/core/primitives/point";
import { Sprite } from "@/core/primitives/sprite";
import type { PointLike, RenderableEntity } from "@/core/types";

export class Player implements RenderableEntity {
    // GAME STATE
    position;
    vector;
    speed;
    previousPosition;

    constructor(initialPosition: PointLike, initialVector: PointLike = { x: 0, y: 0 }, initialSpeed: number = 1) {
        this.position = new Point(initialPosition);
        this.previousPosition = this.position;
        this.vector = new Point(initialVector);
        this.speed = initialSpeed;
    }

    set(point: PointLike) {
        this.previousPosition = this.position.clone();
        this.position = new Point(point);
    }

    // set location without updating previousPosition
    bounceTo(point: PointLike) {
        this.position = new Point(point);
    }

    tick(delta: number, input: KeyboardController) {
        if (input.vector) {
            this.vector = input.vector;
        }

        if (this.vector.equals({ x: 0, y: 0 }) === false) {
            const playerVectorWithSpeed = this.vector.multiplyScalar(this.speed);
            this.set(this.position.add(playerVectorWithSpeed));
        }
    }

    toRenderable() {
        return new Sprite(this.position, "█");
    }
}
