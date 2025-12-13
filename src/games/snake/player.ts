import { Container } from "@/core/primitives/container";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Text } from "@/core/primitives/text";
import type { PointLike, RenderableEntity } from "@/core/types/primitive-types";
import type { TickerDelta } from "@/core/types/ticker-types";
import { Trail } from "@/games/snake/trail";
interface PlayerOptions {
    initialPosition: PointLike;
    initialVector?: PointLike;
    initialSpeed?: number;
}
export class Player implements RenderableEntity {
    static InitialSpeed = 1;
    static InitialMaxTrailLength = 5;
    // toggle to allow player to turn back
    allowReversing = false;

    point;
    vector;
    speed;
    trail;
    fill = "█";
    isAlive = true;

    constructor({ initialPosition, initialVector = { x: 0, y: 0 }, initialSpeed = Player.InitialSpeed }: PlayerOptions) {
        this.point = new Point(initialPosition);
        this.vector = new Point(initialVector);
        this.speed = initialSpeed;

        this.trail = new Trail(() => this.point.round(), Player.InitialMaxTrailLength);
        this.trail.add(initialPosition);
    }

    set(point: PointLike) {
        this.point = new Point(point);
    }

    move(delta: TickerDelta, vector: Point, numApplesCollected: number) {
        this.speed = 1 + numApplesCollected / 5;
        this.trail.maxLength = Player.InitialMaxTrailLength + numApplesCollected * 2;

        const hasNewInput = vector.equals(this.vector) === false;
        const isDeadStick = vector.isZeroZero();
        const reverseVector = this.point.subtract(this.vector.add(this.point));
        const isReverse = isDeadStick === false && this.allowReversing === false && vector.equals(reverseVector);
        if (isReverse === false && isDeadStick === false) {
            // record a change in direction for trail purposes
            const isSamePosition = this.trail.points.at(0) ? this.point.roughlyEquals(this.trail.points[0]) : false;
            if (hasNewInput && isSamePosition === false) {
                this.trail.add(this.point.round());
            }

            this.vector = vector;
        }

        // is the user moving?
        if (this.vector.equals({ x: 0, y: 0 }) === false) {
            const playerVectorWithSpeed = this.vector.multiplyScalar(this.speed * delta.deltaMS);

            this.set(this.point.add(playerVectorWithSpeed));

            this.trail.trim();
        }
    }

    toRenderable() {
        const container = new Container();

        const trail = this.trail.line;
        trail.fill = "-";

        container.add(trail);
        container.add(new Text(this.point, this.fill));

        return container;
    }
}
