import { Canvas } from "@/core/canvas";
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
import { PipeBox } from "@/games/snake/pipe-box";
import { Player } from "@/games/snake/player";
import { Wall } from "@/games/snake/wall";

/**
 * TODO:
 * collission detection does not detect 1-height lines on same axis ( ie o -> o )
 *
 */

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
 * Entities
 */
const player = new Player({ initialPosition: new Point(5, 5) });

// scene.appendChild(new Wall(new Rectangle(new Point(8, 8), 10, 10)));
scene.appendChild(new Wall(new Rectangle(new Point(0, 0), canvas.width, 1)));
scene.appendChild(new Wall(new Rectangle(new Point(0, 0), 1, canvas.height - 6)));
scene.appendChild(new Wall(new Rectangle(new Point(canvas.width - 1, 0), 1, canvas.height - 6)));
scene.appendChild(new Wall(new Rectangle(new Point(0, canvas.height - 6), canvas.width, 1)));

scene.appendChild(player);
// App.scene.add(wall);
// App.scene.add(topWall);
// App.scene.add(leftWall);
// App.scene.add(bottomWall);

const apple = new Apple({ x: 5, y: 5 });

/**
 * HUD
 */
const scoreBox = new Rectangle(Point.ZeroZero, canvas.width, 5);
scoreBox.fill = "█";

const scoreText = new Text(new Point(scoreBox.position).add({ x: 1, y: 1 }), `\nMy score is: ${apple.numCollected}\n`, {
    width: canvas.width - 2,
    align: "center",
    fill: " ",
});

// const liveArea = new PipeBox(Point.ZeroZero, canvas.width, canvas.height - 5);
const scoreContainer = new Node2d().setChildren([scoreBox, scoreText]);
scoreContainer.set({ x: 0, y: canvas.height - 5 });

scene.appendChild(scoreContainer);

/**
 * Death Screen
 */
const skull = new Sprite(new Point(2, 3), {
    content: AssetUtil.load("snake/skull"),
    frameWidth: 10,
    frameHeight: 6,
    numFrames: 10,
});
skull.id = "sprite";

const skullBox = new PipeBox(new Point(0, 0), 12, 9);
skullBox.id = "skullbox";

const skullContainer = new Node2d().setChildren([skullBox, new Text(new Point(2, 1), "u = dead"), skull]);
skullContainer.set(new Point(9, 8));
skullContainer.id = "skucontainer";
scene.appendChild(skullContainer);

/**
 * Game Loop
 */
ticker.add((delta) => {
    // if (player.isAlive) {
    if (input.isDeadStick() === false) {
        player.constantForce = input.cardinalVector;
    }

    scene.process(delta);
    // player.move(delta, App.input.cardinalVector, apple.numCollected);
    // }

    // if (apple.canPlayerClaimApple(player)) {
    //     apple.claimApple();
    //     apple.generateApple(liveArea.rectangle, new PolyLine([]));
    // }

    scoreText.text = `\nMy score is: ${apple.numCollected}\n`;

    // buffer.appendChild(player);
    // buffer.appendChild(wall);
    // buffer.appendChild(topWall);
    // buffer.appendChild(leftWall);
    // buffer.appendChild(rightWall);
    // buffer.appendChild(bottomWall);
    // buffer.appendChild(apple);

    skull.next(10 * delta.deltaTime);
    // if (player.isAlive === false) {
    // skull.next(10 * delta.deltaTime);
    //     buffer.add(skullContainer);
    // }

    canvas.draw(scene);
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

const FPSDom = document.querySelector(".fps");
if (FPSDom) {
    FPSDom.textContent = `FPS: ${ticker.FPS}`;
}

console.log("-- Starting! --");
