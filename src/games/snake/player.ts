import { RigidBody } from "@/core/physics/rigid-body";
import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";
import { Text } from "@/core/primitives/text";
import type { BoundingBox, PhysicsBody, PointLike, RenderableEntity } from "@/core/types/primitive-types";
import type { TickerDelta } from "@/core/types/ticker-types";
import { calculateBoundingBoxFromPoints } from "@/core/utils/geometry-util";
import { Trail } from "@/games/snake/trail";
interface PlayerOptions {
    initialPosition: PointLike;
    initialVector?: PointLike;
    initialSpeed?: number;
}
export class Player extends Node2d implements RenderableEntity {
    static InitialSpeed = 1;
    static InitialMaxTrailLength = 5;
    // toggle to allow player to turn back
    allowReversing = false;

    // trail;
    fill = "█";
    isAlive = true;

    constructor({ initialPosition }: PlayerOptions) {
        super();
        // this.trail = new Trail(() => this.point.round(), Player.InitialMaxTrailLength);
        // this.trail.add(initialPosition);

        this.set(initialPosition);
        this.body = new RigidBody();
        this.body.setBoundingBox(this.boundingBox);
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

    toRenderable() {
        const container = new Node2d();

        // const trail = this.trail.line;
        // trail.fill = "-";

        // container.add(trail);
        container.appendChild(new Text(this.position, this.fill));

        return container;
    }
}
