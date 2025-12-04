import { DIRECTION_MAP } from "@/core/core-constants";
import type { KeyboardController } from "@/core/keyboard-controller";
import { Container } from "@/core/primitives/container";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Ray } from "@/core/primitives/ray";
import { Sprite } from "@/core/primitives/sprite";
import { RayCaster } from "@/core/ray-caster";
import type { PointLike, RectangleLike, RenderableEntity } from "@/core/types";
import type { InputEvent } from "@/core/types/input-types";
interface PlayerOptions {
    initialPosition: PointLike;
    initialVector?: PointLike;
    initialSpeed?: number;
    maxTrailLength?: number;
    controller: KeyboardController;
}
export class Player implements RenderableEntity {
    position;
    vector;
    speed;
    maxTrailLength;
    history: PointLike[] = [];
    fill = "█";
    isAlive = true;
    allowReversing;
    collissionRay?: RayCaster;

    debugRay?: Ray;
    debugCollisions?: RayCaster;

    constructor({ initialPosition, initialVector = { x: 0, y: 0 }, initialSpeed = 1, maxTrailLength, controller }: PlayerOptions) {
        this.position = new Point(initialPosition);
        this.vector = new Point(initialVector);
        this.speed = initialSpeed;
        this.maxTrailLength = maxTrailLength;

        // toggle to allow player to turn back
        this.allowReversing = true;

        // listen for input events
        controller.events.on<InputEvent>("keydown", (e) => {
            // determine direction
            const numKeysPressed = Object.entries(e.keys).filter(([, value]) => value.pressed).length;
            const { vector } =
                DIRECTION_MAP.find((row) => {
                    return row.keys.length === numKeysPressed && row.keys.every((key) => e.keys[key].pressed);
                }) ?? {};
            const inputVector = new Point(vector ?? { x: 0, y: 0 });

            // set local vector if one is found
            const hasNewInput = inputVector.equals(this.vector) === false;
            const isDeadStick = inputVector.equals({ x: 0, y: 0 });
            const reverseVector = this.position.subtract(this.vector.add(this.position));
            const isReverse = isDeadStick === false && this.allowReversing === false && inputVector.equals(reverseVector);
            if (isReverse === false && isDeadStick === false) {
                // record a change in direction for trail purposes
                if (hasNewInput && this.position.equals(this.history.at(0)) === false) {
                    this.history.unshift(this.position);
                }

                this.vector = inputVector;
            }

            this.fill = isReverse ? "X" : "█";
        });
    }

    set(point: PointLike) {
        this.position = new Point(point);
    }

    move(boundary: RectangleLike) {
        // is the user moving?
        if (this.vector.equals({ x: 0, y: 0 }) === false) {
            const playerVectorWithSpeed = this.vector.multiplyScalar(this.speed);

            // Fire a ray from the current position to test collisions
            const playerCollisionRay = new Ray(this.position, this.vector, this.speed);
            this.collissionRay = new RayCaster(playerCollisionRay, boundary);

            // BORKED
            // Intersections from the debug ray do no prevent movement.
            const trail = new PolyLine([this.position, ...this.history]);
            this.debugRay = new Ray(this.position, this.vector, 10);
            this.debugRay.line.stroke = "-";
            this.debugCollisions = new RayCaster(this.debugRay, [boundary, trail]);

            if (this.collissionRay.hasIntersection) {
                if (this.collissionRay.firstIntersection?.point) {
                    const safePoint = new Point(this.collissionRay.firstIntersection.point).subtract(this.vector);
                    this.set(safePoint);

                    // oh no!!
                    this.isAlive = false;
                }
            } else {
                this.set(this.position.add(playerVectorWithSpeed));
            }
        }
    }

    toRenderable() {
        const container = new Container();
        const trail = new PolyLine([this.position, ...this.history]);
        trail.stroke = "-";
        container.add(trail);

        if (this.debugRay) {
            container.add(this.debugRay.line);

            this.debugCollisions?.intersections?.forEach((intersection) => {
                if (intersection.face) {
                    const line = new Line(intersection.face);
                    line.stroke = "X";
                    container.add(line);

                    container.add(new Sprite(intersection.point, "*"));
                }
            });
        }

        container.add(new Sprite(this.position, this.fill));

        return container;
    }
}
