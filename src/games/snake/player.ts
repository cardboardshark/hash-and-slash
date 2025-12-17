import { DIRECTION_MAP, INPUT } from "@/core/core-constants";
import { RigidBody } from "@/core/physics/rigid-body";
import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import type { PhysicsBody, PointLike } from "@/core/types/primitive-types";
import type { TickerDelta } from "@/core/types/ticker-types";
import { AssetUtil } from "@/core/utils/asset-util";
import { calculateBoundingBoxFromPoints } from "@/core/utils/geometry-util";
import { Trail } from "@/games/snake/trail";
interface PlayerOptions {
    initialPosition: PointLike;
    initialVector?: PointLike;
    initialSpeed?: number;
}
export class Player extends RigidBody {
    static InitialSpeed = 1;
    static InitialMaxTrailLength = 5;
    // toggle to allow player to turn back
    allowReversing = false;
    inertia = 1;

    // trail;
    fill = "█";
    isAlive = true;

    constructor({ initialPosition }: PlayerOptions) {
        super();
        // this.trail = new Trail(() => this.point.round(), Player.InitialMaxTrailLength);
        // this.trail.add(initialPosition);
        this.set(initialPosition);
    }

    bodyEntered(other: PhysicsBody) {
        // console.log("HELLO", other);
    }

    // set(point: PointLike) {
    //     this.point = new Point(point);
    // }

    move(delta: TickerDelta, vector: Point, numApplesCollected: number) {
        // this.speed = 1 + numApplesCollected / 5;
        // this.trail.maxLength = Player.InitialMaxTrailLength + numApplesCollected * 2;
        // const hasNewInput = vector.equals(this.vector) === false;
        // const isDeadStick = vector.isZeroZero();
        // const reverseVector = this.point.subtract(this.vector.add(this.point));
        // const isReverse = isDeadStick === false && this.allowReversing === false && vector.equals(reverseVector);
        // // record a change in direction for trail purposes
        // if (isReverse === false && isDeadStick === false) {
        //     const isSamePosition = this.trail.points.at(0) ? this.point.roughlyEquals(this.trail.points[0]) : false;
        //     if (hasNewInput && isSamePosition === false) {
        //         this.trail.add(this.point.round());
        //     }
        //     this.vector = vector;
        // }
        // // is the user moving?
        // if (this.vector.equals({ x: 0, y: 0 }) === false) {
        //     const playerVectorWithSpeed = this.vector.multiplyScalar(this.speed * delta.deltaMS);
        //     this.set(this.point.add(playerVectorWithSpeed));
        //     this.trail.trim();
        // }
    }

    get boundingBox() {
        return this.sprite.boundingBox;
    }

    get sprite() {
        return new Sprite(this.position, { content: AssetUtil.load("snake/rocket"), frameWidth: 3, frameHeight: 3, numFrames: 4 });
    }

    draw() {
        const container = new Node2d();

        const sprite = this.sprite;
        if (this.constantForce?.equals(DIRECTION_MAP.left.vector)) {
            this.origin = "0 50%";
            sprite.setFrame(3);
        } else if (this.constantForce?.equals(DIRECTION_MAP.right.vector)) {
            sprite.setFrame(1);
            this.origin = "100% 50%";
        } else if (this.constantForce?.equals(DIRECTION_MAP.down.vector)) {
            sprite.setFrame(2);
            this.origin = "50% 100%";
        } else if (this.constantForce?.equals(DIRECTION_MAP.up.vector)) {
            this.origin = "50% 0";
            sprite.setFrame(0);
        }

        container.appendChild(sprite);

        return container.draw();
    }
}
