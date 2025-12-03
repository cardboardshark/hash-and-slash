import { Canvas } from "@/core/canvas";
import { DEG_TO_RAD } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Container } from "@/core/primitives/container";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { RayCaster } from "@/core/ray-caster";
import { Ticker } from "@/core/ticker";
import { random } from "lodash";

const config = {
    fps: 10,
    canvas: {
        width: 30,
        height: 30,
        element: document.querySelector<HTMLElement>(".canvas"),
        fill: "≍",
    },
};

const canvas = new Canvas(config.canvas);
canvas.debugMode = true;
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

const liveArea = new Rectangle({ x: 0, y: 0 }, { x: config.canvas.width - 1, y: config.canvas.height - 5 });
liveArea.fill = " ";
liveArea.stroke = "#";

const playerHistoryPath = new PolyLine([playerPos]);
playerHistoryPath.stroke = "-";

const gameState: GameState = {
    apple: randomlyPlaceApple(liveArea, playerHistoryPath),
    score: 0,
};

const spotlight = new Line(new Point(config.canvas.width / 2, config.canvas.height / 2), new Point(40, 15));
let rotation = 0;

// const scoreBox = new Rectangle(new Point(0, config.canvas.height - 5), new Point(config.canvas.width, config.canvas.height));
// scoreBox.fill = "█";

ticker.add((delta) => {
    const buffer = new Container();

    buffer.add(liveArea);
    // buffer.add(scoreBox);
    const scoreBox = new Rectangle(new Point(0, 0), new Point(config.canvas.width, 4));
    scoreBox.fill = "█";

    const group = new Container([
        scoreBox,
        new Text(new Point(1, 1), `\nMy score is: ${gameState.score}\n`, { width: config.canvas.width - 2, align: "center", fill: " " }),
    ]);
    group.set(0, config.canvas.height - 5);
    buffer.add(group);

    let hasVectorChanged = false;
    if (input.vector) {
        hasVectorChanged = playerVector.equals(input.vector) === false;
        playerVector = input.vector;
    }
    if (hasVectorChanged) {
        playerHistoryPath.add(playerPos);
    }

    if (playerHistoryPath.last && new Point(playerHistoryPath.last).equals(playerPos) === false) {
        const lastHistorySegment = new Line(playerHistoryPath.last, playerPos);
        lastHistorySegment.stroke = "-";
        buffer.add(lastHistorySegment);
    }

    if (playerVector.equals({ x: 0, y: 0 }) === false) {
        const playerVectorWithSpeed = new Point(playerVector).multiplyScalar(playerSpeed);

        const newPos = playerPos.add(playerVectorWithSpeed);
        const playerProjectedPath = new Line(playerPos, newPos);
        playerProjectedPath.stroke = "=";

        buffer.add(playerProjectedPath);

        const outOfBounds = liveArea.contains(newPos) === false;
        const historyIntersection = new RayCaster(playerProjectedPath, [liveArea]);

        if (historyIntersection.firstIntersction?.face) {
            const intersectionFace = new Line(historyIntersection.firstIntersction?.face);
            intersectionFace.stroke = "X";
            buffer.add(intersectionFace);
            buffer.add(new Sprite(historyIntersection.firstIntersction.point, "*"));
        }
        if (outOfBounds || historyIntersection.hasIntersection) {
            console.log("oh no");
        } else {
            playerPos = newPos;
        }
        const rayResult = new RayCaster(playerProjectedPath, gameState.apple);
        if (rayResult.hasIntersection) {
            gameState.score += 1;
            gameState.apple = randomlyPlaceApple(liveArea, playerHistoryPath);
        }
    }

    buffer.add(new Sprite(gameState.apple, "ó"));

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

    buffer.add(playerHistoryPath);
    buffer.add(new Sprite(playerPos, "█"));

    canvas.draw(buffer);

    rotation += 3 * DEG_TO_RAD;
});

function randomlyPlaceApple(liveArea: Rectangle, playerPath: PolyLine) {
    const liveAreaPoints = [];
    for (let y = liveArea.topLeft.y; y < liveArea.bottomRight.y; y += 1) {
        for (let x = liveArea.topLeft.x; x < liveArea.bottomRight.x; x += 1) {
            liveAreaPoints.push({ x, y });
        }
    }

    const filledSpaces = new Set<string>(playerPath.lines.flatMap((l) => l.toPoints().map((p) => `${p.x},${p.y}`)));
    const validSpaces = liveAreaPoints.filter((p) => filledSpaces.has(`${p.x},${p.y}`) === false);
    return new Point(validSpaces[random(0, validSpaces.length - 1)]);
}

// debug helper
ticker.add(DisplayKeyboardInput(input));

console.log("-- Starting! --");
ticker.start();
