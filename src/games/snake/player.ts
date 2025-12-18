import { DIRECTION_MAP, INPUT } from "@/core/core-constants";
import { PhysicsBody } from "@/core/physics/physic-body";
import { RigidBody } from "@/core/physics/rigid-body";
import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { RotatingSprite } from "@/core/primitives/rotating-sprite";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { Pixel } from "@/core/types/canvas-types";
import type { IntersectingPixels, PointLike } from "@/core/types/primitive-types";
import type { TickerDelta } from "@/core/types/ticker-types";
import { AssetUtil } from "@/core/utils/asset-util";
import { calculateBoundingBoxFromPoints } from "@/core/utils/geometry-util";
import { Apple } from "@/games/snake/apple";
import { Trail } from "@/games/snake/trail";
import { Wall } from "@/games/snake/wall";
import { uniqBy } from "lodash";
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
    sprite;
    damage: Point[] = [];
    score = 0;

    constructor({ initialPosition }: PlayerOptions) {
        super();
        // this.trail = new Trail(() => this.point.round(), Player.InitialMaxTrailLength);
        // this.trail.add(initialPosition);
        this.set(initialPosition);
        this.sprite = new RotatingSprite(Point.ZeroZero, { content: AssetUtil.load("snake/rocket"), width: 3, height: 3, numFrames: 4 });
    }

    bodyEntered(other: PhysicsBody, intersections: IntersectingPixels[]) {
        this.isAlive = false;
        if (other instanceof Wall) {
            const existingDamage = this.damage.reduce<Record<string, Point>>((acc, p) => {
                acc[`${p.x},${p.y}`] = p;
                return acc;
            }, {});
            const incomingDamage = intersections.reduce<Record<string, Point>>((acc, i) => {
                acc[`${i.source.x},${i.source.y}`] = new Point(i.source);
                return acc;
            }, {});

            this.damage = Object.values({ ...existingDamage, ...incomingDamage });
        } else if (other instanceof Apple) {
            this.score += 1;
        }
    }

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
        const rect = new Rectangle(this.position, 3, 3);
        rect.origin = this.origin;
        return rect.boundingBox;
    }

    draw() {
        const container = new Node2d();
        container.set(this.position);

        const sprite = this.sprite;

        sprite.setFrame("up");
        this.origin = "100% 50%";
        let rotation = 0;

        const rect = new Rectangle(Point.ZeroZero, 3, 3);
        if (this.constantForce?.equals(DIRECTION_MAP.left.vector)) {
            this.origin = "0 50%";
            sprite.setFrame("left");
            rotation = 180;
        } else if (this.constantForce?.equals(DIRECTION_MAP.right.vector)) {
            sprite.setFrame("right");
            this.origin = "100% 50%";
            rotation = 0;
        } else if (this.constantForce?.equals(DIRECTION_MAP.down.vector)) {
            sprite.setFrame("down");
            this.origin = "50% 100%";
            rotation = 90;
        } else if (this.constantForce?.equals(DIRECTION_MAP.up.vector)) {
            this.origin = "50% 0";
            sprite.setFrame("up");
            rotation = 270;
        }
        container.appendChild(sprite);

        // rect.origin = this.origin;
        // rect.background = { src: "123\n345\n678" };
        // rect.rotate = rotation;
        // container.appendChild(rect);
        const damage = Text.fromPoints(Point.ZeroZero, this.damage);
        damage.rotate = rotation;
        container.appendChild(damage);
        // .rotate(rotation).toString();
        // console.log("HEY", this.damage, damageBuffer);
        // container.appendChild(new Text(new Point(0, 0), damageBuffer));

        return container.draw();
    }
}
