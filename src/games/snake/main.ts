import { Canvas } from "@/core/canvas";
import { DIRECTION_MAP } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Node2d } from "@/core/primitives/node-2d";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { Scene } from "@/core/scene";
import { Ticker } from "@/core/ticker";
import { AssetUtil } from "@/core/utils/asset-util";
import { Apple } from "@/games/snake/apple";
import { Bouncy } from "@/games/snake/bouncy";
import { PipeBox } from "@/games/snake/pipe-box";
import { Player } from "@/games/snake/player";
import { Wall } from "@/games/snake/wall";

const ticker = new Ticker();
const input = new KeyboardController();
const scene = new Scene();

const canvas = new Canvas({
    width: 30,
    height: 30,
    element: document.querySelector<HTMLElement>(".canvas"),
});
canvas.debugMode = true;

/**
 * Game State
 */
let numApples = 0;
let isAlive = true;

/**
 * Entities
 */
const player = new Player({ initialPosition: new Point(3, 3) });

const liveArea = new Rectangle(new Point(1, 1), canvas.width - 1, canvas.height - 6);

// scene.appendChild(new Wall(new Rectangle(new Point(8, 8), 10, 10)));
scene.appendChild(new Wall(new Rectangle(new Point(0, 0), canvas.width, 1)));
scene.appendChild(new Wall(new Rectangle(new Point(0, 0), 1, canvas.height - 6)));
scene.appendChild(new Wall(new Rectangle(new Point(canvas.width - 1, 0), 1, canvas.height - 6)));
scene.appendChild(new Wall(new Rectangle(new Point(0, canvas.height - 6), canvas.width, 1)));

const apple = new Apple();
apple.placeNewApple(liveArea);
scene.appendChild(apple);

/**
 * HUD
 */
const scoreBox = new Rectangle(Point.ZeroZero, canvas.width, 5);
scoreBox.background = { fill: "█" };

const scoreText = new Text(new Point(scoreBox.position).add({ x: 1, y: 1 }), `\nMy score is: ${numApples}\n`, {
    width: canvas.width - 2,
    align: "center",
    fill: " ",
});

const scoreContainer = new Node2d().setChildren([scoreBox, scoreText]);
scoreContainer.set({ x: 0, y: canvas.height - 5 });

scene.appendChild(scoreContainer);

const background = new Sprite(new Point(canvas.width - 2, canvas.height - 6), AssetUtil.load("tree"));
background.origin = "100% 100%";
scene.appendChild(background);

scene.appendChild(player);

const pong = new Bouncy();
pong.set(new Point(20, 10));
pong.constantForce = DIRECTION_MAP.down.vector;
pong.on("bodyEntered", ({ other }) => {
    if (other instanceof Wall && pong.constantForce) {
        pong.constantForce = pong.constantForce.rotate(180);
    }
});
scene.appendChild(pong);

/**
 * Death Screen
 */
const skull = new Sprite(new Point(2, 3), {
    content: AssetUtil.load("skull"),
    width: 10,
    height: 6,
    numFrames: 10,
});
skull.id = "sprite";

const skullBox = new PipeBox(new Point(0, 0), 12, 9);
skullBox.fill = " ";
skullBox.id = "skullbox";

const skullContainer = new Node2d().setChildren([skullBox, new Text(new Point(2, 1), "u = dead"), skull]);
skullContainer.set(new Point(9, 8));
skullContainer.id = "skucontainer";
skullContainer.visible = false;
scene.appendChild(skullContainer);

player.on("bodyEntered", ({ other }) => {
    if (other instanceof Apple) {
        numApples += 1;
        player.inertia += 0.5;
    } else if (other instanceof Wall || other instanceof Bouncy) {
        isAlive = false;
    }
});
player.on("bodyExited", ({ other }) => {
    if (other instanceof Apple) {
        apple.placeNewApple(liveArea);
    }
});

/**
 * Game Loop
 */
ticker.add((delta) => {
    if (input.isDeadStick() === false) {
        player.constantForce = input.cardinalVector;
    }

    player.process();
    scene.process(delta);

    scoreText.text = `\nMy score is: ${numApples}\n`;

    if (isAlive === false) {
        skull.next(10 * delta.deltaTime);
        skullContainer.visible = true;
        ticker.paused = true;
    }

    canvas.draw(scene);
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

const FPSDom = document.querySelector(".fps");
if (FPSDom) {
    FPSDom.textContent = `FPS: ${ticker.FPS}`;
}

console.log("-- Starting! --");
