import { Canvas } from "@/core/canvas";
import { DEG_TO_RAD } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { CanvasBuffer } from "@/core/primitives/canvas-buffer";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Polygon } from "@/core/primitives/polygon";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { Ticker } from "@/core/ticker";
import type { PointLike } from "@/core/types";
import { random, range } from "lodash";

const config = {
    fps: 10,
    canvas: {
        width: 30,
        height: 30,
        element: document.querySelector<HTMLElement>(".canvas"),
        fill: "#",
    },
};

const canvas = new Canvas(config.canvas);
const ticker = new Ticker(config.fps);
const input = new KeyboardController();

// GAME STATE
let playerPos = new Point(3, 3);
let playerVector = new Point(0, 0);
let playerSpeed = 1;

interface GameState {
    apple: Point;
    score: number;
}

const liveArea = new Rectangle({ x: 1, y: 1 }, { x: config.canvas.width - 1, y: config.canvas.height - 3 });
const playerHistoryPath = new Polygon([playerPos]);

const gameState: GameState = {
    apple: randomlyPlaceApple(liveArea, playerHistoryPath),
    score: 0,
};

const spotlight = new Line(new Point(config.canvas.width / 2, config.canvas.height / 2), new Point(40, 15));
let rotation = 0;

ticker.add((delta) => {
    const buffer = new CanvasBuffer();

    buffer.push(liveArea, { fill: " " });

    // score
    buffer.push(
        new Text(new Point(1, config.canvas.height - 2), `My score is: ${gameState.score}`, { width: config.canvas.width - 2, align: "center", fill: " " })
    );

    let hasVectorChanged = false;
    if (input.vector) {
        hasVectorChanged = playerVector.equals(input.vector) === false;
        playerVector = input.vector;
    }
    if (hasVectorChanged) {
        playerHistoryPath.add(playerPos);
    }

    if (playerHistoryPath.last) {
        buffer.push(new Line(playerHistoryPath.last, playerPos), { stroke: "-" });
    }

    if (playerVector) {
        const playerVectorWithSpeed = new Point(playerVector).multiplyScalar(playerSpeed);

        const newPos = playerPos.add(playerVectorWithSpeed);
        const playerProjectedPath = new Line(playerPos, newPos);
        if (playerProjectedPath.intersects(liveArea)) {
            console.log("OUT OF FBOUNDS");
        }
        buffer.push(playerProjectedPath, { stroke: "=" });

        const outOfBounds = liveArea.contains(newPos) === false;
        const hasCollission = playerHistoryPath.strokeContains(newPos);
        if (outOfBounds || hasCollission) {
            console.log("oh no");
        } else {
            playerPos = newPos;
        }

        buffer.push(new Sprite(gameState.apple, "ó"));
        if (playerProjectedPath.contains(gameState.apple)) {
            gameState.score += 1;
            gameState.apple = randomlyPlaceApple(liveArea, playerHistoryPath);
        }
    }

    spotlight.rotate(rotation);
    // spriteStack.add(spotlight.toSprite("+"));

    // const rayIntersection = spotlight.getIntersection(liveArea);
    // if (rayIntersection) {
    //     const rayDistance = spotlight.start.distanceTo(rayIntersection.point);
    //     const remainingRayDistance = spotlight.length - rayDistance;
    //     const normal = rayIntersection.line.getNormal();
    //     const end = rayIntersection.point.normalize().reflect(normal).multiplyScalar(remainingRayDistance).add(rayIntersection.point).round();
    //     const rayBounce = new Line(rayIntersection.point, end);
    //     spriteStack.add(rayBounce.toSprite("-"));
    //     spriteStack.add(new Sprite(rayIntersection.point, "X"));
    // }

    buffer.push(playerHistoryPath, { stroke: "-" });
    buffer.push(new Sprite(playerPos, "█"));

    canvas.draw(buffer);

    rotation += 3 * DEG_TO_RAD;
});

function randomlyPlaceApple(liveArea: Rectangle, playerPath: Polygon) {
    const filledSpaces = new Set<string>(playerPath.lines.flatMap((l) => l.toPoints().map((p) => `${p.x},${p.y}`)));
    const validSpaces = liveArea.toPoints().filter((p) => filledSpaces.has(`${p.x},${p.y}`) === false);
    return new Point(validSpaces[random(0, validSpaces.length - 1)]);
}

// debug helper
ticker.add(DisplayKeyboardInput(input));

console.log("-- Starting! --");
ticker.start();
