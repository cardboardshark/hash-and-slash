import { Canvas } from "@/core/canvas";
import { DEG_TO_RAD } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { Polygon } from "@/core/primitives/polygon";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { SpriteCollection } from "@/core/primitives/sprite-collection";
import { Ticker } from "@/core/ticker";
import { loadAsset } from "@/core/utils/asset-utils";

const config = {
    fps: 10,
    canvas: {
        width: 30,
        height: 30,
        element: document.querySelector<HTMLElement>(".canvas"),
        fill: "#",
    },
};

function GameImplementation() {
    const canvas = new Canvas(config.canvas);
    const ticker = new Ticker(config.fps);
    const input = new KeyboardController();

    const dogFile = loadAsset("snake/dog");

    // init game state
    let playerPos = new Point(3, 3);
    let playerVector = new Point(0, 0);
    let playerSpeed = 2;

    const spotlight = new Line(new Point(config.canvas.width / 2, config.canvas.height / 2), new Point(40, 15));
    let rotation = 0;

    const rectA = new Rectangle(new Point(5, 5), new Point(10, 10));
    const rectB = new Rectangle(new Point(10, 10), new Point(25, 25));

    const pathPolygon = new Polygon([playerPos]);
    ticker.add((delta) => {
        const spriteStack = new SpriteCollection();
        const liveArea = new Rectangle({ x: 1, y: 1 }, { x: config.canvas.width - 1, y: config.canvas.height - 1 });

        spriteStack.add(liveArea.toSprite({ fill: " " }));

        let hasVectorChanged = false;
        if (input.vector) {
            hasVectorChanged = playerVector.equals(input.vector) === false;
            playerVector = input.vector;
        }
        if (hasVectorChanged) {
            pathPolygon.add(playerPos);
        }

        if (pathPolygon.last) {
            spriteStack.add(new Line(pathPolygon.last, playerPos).toSprite("?"));
        }

        if (playerVector) {
            const playerVectorWithSpeed = new Point(playerVector).multiplyScalar(playerSpeed);

            const newPos = playerPos.add(playerVectorWithSpeed);
            const playerProjectedPath = new Line(pathPolygon.last, newPos);
            if (playerProjectedPath.intersects(liveArea)) {
                console.log("OUTO FBOUNDS");
            }
            spriteStack.add(playerProjectedPath.toSprite("+"));

            const outOfBounds = liveArea.contains(newPos) === false;
            const hasCollission = pathPolygon.strokeContains(newPos) || rectA.contains(newPos) || rectB.contains(newPos);
            if (outOfBounds || hasCollission) {
                console.log("oh no");
            } else {
                playerPos = newPos;
            }
        }

        spriteStack.add(rectA.toSprite({ fill: "-", stroke: "A" }));
        spriteStack.add(rectB.toSprite({ fill: "-", stroke: "B" }));

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

        spriteStack.add(pathPolygon.toSprite({ stroke: "!" }));
        spriteStack.add(new Sprite(playerPos, "█"));

        canvas.draw(spriteStack);

        rotation += 3 * DEG_TO_RAD;
    });

    // debug helper
    ticker.add(DisplayKeyboardInput(input));

    return {
        ticker,
        input,
        start() {
            console.log("-- Starting! --");
            console.log(dogFile);
            ticker.start();
        },
    };
}

// init the game
const game = GameImplementation();
game.start();

export { game };
