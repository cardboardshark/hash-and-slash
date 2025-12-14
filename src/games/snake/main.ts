import { App } from "@/core/app";
import { Canvas } from "@/core/canvas";
import { Container } from "@/core/primitives/container";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
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

const canvas = Canvas.make({
    width: 30,
    height: 30,
    element: document.querySelector<HTMLElement>(".canvas"),
});
canvas.debugMode = true;

/**
 * Entities
 */
const player = new Player({ initialPosition: new Point(5, 3) });
const wall = new Wall(new Rectangle(new Point(5, 5), 10, 10));
App.scene.add(player);
App.scene.add(wall);

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

const liveArea = new PipeBox(Point.ZeroZero, canvas.width, canvas.height - 5);
const scoreContainer = new Container([scoreBox, scoreText]);
scoreContainer.set({ x: 0, y: canvas.height - 5 });

const hud = new Container([liveArea, scoreContainer]);

/**
 * Death Screen
 */
const skull = new Sprite(new Point(2, 3), {
    content: AssetUtil.load("snake/skull"),
    frameWidth: 10,
    frameHeight: 6,
    numFrames: 10,
});
const skullBox = new PipeBox(new Point(0, 0), 12, 9);
const skullContainer = new Container([skullBox, new Text(new Point(2, 1), "u = dead"), skull]);
skullContainer._debug = true;
skullContainer.set(new Point(9, 8));

/**
 * Game Loop
 */
App.ticker.add((delta) => {
    // if (player.isAlive) {
    if (App.input.isDeadStick() === false) {
        player.constantForce = App.input.cardinalVector;
    }

    App.scene.process(delta);
    // player.move(delta, App.input.cardinalVector, apple.numCollected);
    // }

    // if (apple.canPlayerClaimApple(player)) {
    //     apple.claimApple();
    //     apple.generateApple(liveArea.rectangle, new PolyLine([]));
    // }

    scoreText.text = `\nMy score is: ${apple.numCollected}\n`;

    const buffer = new Container();

    buffer.add(hud);

    console.log("hm", player.position);
    buffer.add(player);
    buffer.add(wall);
    buffer.add(apple);

    // buffer.add(skullContainer);
    // skull.next(10 * delta.deltaTime);
    // if (player.isAlive === false) {
    // skull.next(10 * delta.deltaTime);
    //     buffer.add(skullContainer);
    // }

    canvas.draw(buffer);
});

// debug helper
// ticker.add(DisplayKeyboardInput(input));

const FPSDom = document.querySelector(".fps");
if (FPSDom) {
    FPSDom.textContent = `FPS: ${App.ticker.FPS}`;
}

console.log("-- Starting! --");
