import { Canvas } from "@/core/canvas";
import { DIRECTION_MAP } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { Point } from "@/core/geometry/point";
import { Rectangle } from "@/core/geometry/rectangle";
import { KeyboardController } from "@/core/keyboard-controller";
import { Scene } from "@/core/scene";
import { Ticker } from "@/core/ticker";
import { Ball } from "@/games/bounce/ball";
import { Wall } from "@/games/snake/wall";

const ticker = new Ticker();
const input = new KeyboardController();
const scene = new Scene();

// scene.constantForce = DIRECTION_MAP.down.vector.multiplyScalar(1);
// scene.linearVelocity = 1;

const canvas = new Canvas({
    width: 30,
    height: 30,
    element: document.querySelector<HTMLElement>(".canvas"),
});
canvas.debugMode = true;

const ball = new Ball();
ball.set(new Point(3, 3));
// ball.setConstantForce(DIRECTION_MAP.right.vector);
ball.linearVelocity = DIRECTION_MAP.right.vector.multiplyScalar(3);
scene.appendChild(ball);

scene.appendChild(new Wall(new Rectangle(new Point(0, 0), canvas.width, 1)));
scene.appendChild(new Wall(new Rectangle(new Point(0, 0), 1, canvas.height - 1)));
scene.appendChild(new Wall(new Rectangle(new Point(canvas.width - 1, 0), 1, canvas.height - 1)));
scene.appendChild(new Wall(new Rectangle(new Point(0, canvas.height - 1), canvas.width, 1)));
/**
 * Game Loop
 */
ticker.add((delta) => {
    scene.process(delta);
    canvas.draw(scene);
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

const FPSDom = document.querySelector(".fps");
if (FPSDom) {
    FPSDom.textContent = `FPS: ${ticker.FPS}`;
}

console.log("-- Starting! --");
