import { Canvas } from "@/core/canvas";
import { INPUT } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Container } from "@/core/primitives/container";
import { Line } from "@/core/primitives/line";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Ray } from "@/core/primitives/ray";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { RayCaster } from "@/core/ray-caster";
import { Ticker } from "@/core/ticker";
import { Apple } from "@/games/snake/apple";
import { Player } from "@/games/snake/player";
import { Trail } from "@/games/snake/trail";

/**
 * TODO:
 * collission detection does not detect 1-height lines on same axis ( ie o -> o )
 * Input is not detected frequently enough
 */
const config = {
    fps: 10,
    canvas: {
        width: 20,
        height: 20,
        element: document.querySelector<HTMLElement>(".canvas"),
        fill: "≍",
    },
};

const canvas = new Canvas(config.canvas);
canvas.debugMode = true;
const ticker = new Ticker(config.fps);
const input = new KeyboardController();

// GAME STATE
let initialPlayerPosition = new Point(3, 3);

const liveArea = new Rectangle({ x: -1, y: -1 }, { x: config.canvas.width, y: config.canvas.height - 5 });
liveArea.fill = " ";
liveArea.stroke = "#";

const player = new Player(initialPlayerPosition);
const playerTrail = new Trail(player, 20);
const apple = new Apple({ x: 5, y: 5 });

let isPaused = false;
ticker.add((delta) => {
    if (input.keys[INPUT.SPACE].pressed) {
        if (isPaused) {
            isPaused = false;
        } else {
            isPaused = true;
        }
    }
    if (isPaused) {
        return;
    }
    const buffer = new Container();

    buffer.add(liveArea);
    const scoreBox = new Rectangle(new Point(0, 0), new Point(config.canvas.width, 4));
    scoreBox.fill = "█";

    const group = new Container([
        scoreBox,
        new Text(new Point(1, 1), `\nMy score is: ${apple.numCollected}\n`, { width: config.canvas.width - 2, align: "center", fill: " " }),
    ]);
    group.set(0, config.canvas.height - 5);
    buffer.add(group);

    // Player code
    player.tick(delta, input);

    const playerPathRay = new Ray(player.previousPosition, player.vector, player.speed);
    const playerPathIntersection = new RayCaster(playerPathRay, liveArea);
    if (playerPathIntersection.hasIntersection) {
        if (playerPathIntersection.firstIntersection?.point) {
            const safePoint = new Point(playerPathIntersection.firstIntersection.point).subtract(player.vector);
            player.bounceTo(safePoint);
        }

        playerPathIntersection.intersections?.forEach((intersection) => {
            if (intersection.face) {
                const intersectionFace = new Line(intersection.face);
                intersectionFace.stroke = "X";
                buffer.add(intersectionFace);
            }

            buffer.add(new Sprite(intersection.point, "*"));
        });
    }

    playerTrail.tick(delta);

    buffer.add(playerTrail);
    buffer.add(player);

    if (apple.canPlayerClaimApple(player)) {
        apple.claimApple();
        apple.generateApple(liveArea, playerTrail.toRenderable());
    }

    buffer.add(apple);

    canvas.draw(buffer);
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

console.log("-- Starting! --");
ticker.start();
