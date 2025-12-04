import { Canvas } from "@/core/canvas";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Container } from "@/core/primitives/container";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Rectangle } from "@/core/primitives/rectangle";
import { SpriteSheet } from "@/core/primitives/spritesheet";
import { Text } from "@/core/primitives/text";
import { Ticker } from "@/core/ticker";
import { AssetUtil } from "@/core/utils/asset-util";
import { Apple } from "@/games/snake/apple";
import { PipeBox } from "@/games/snake/pipe-box";
import { Player } from "@/games/snake/player";

/**
 * TODO:
 * collission detection does not detect 1-height lines on same axis ( ie o -> o )
 * Input is not detected frequently enough
 *
 * Separate input controller from ticker logic
 * Player listens for input, sets planned movement but does not execute movement until tick
 *
 */
const config = {
    fps: 15,
    canvas: {
        width: 30,
        height: 30,
        element: document.querySelector<HTMLElement>(".canvas"),
    },
};

const canvas = new Canvas(config.canvas);
canvas.debugMode = true;
const ticker = new Ticker(config.fps);
const input = new KeyboardController();

/**
 * Entities
 */
const player = new Player({ initialPosition: new Point(3, 3), controller: input });
const apple = new Apple({ x: 5, y: 5 });

/**
 * HUD
 */
const scoreBox = new Rectangle({ x: 0, y: 0 }, new Point(config.canvas.width, 5));
scoreBox.fill = "█";

const scoreText = new Text(new Point(scoreBox.topLeft).add({ x: 1, y: 1 }), `\nMy score is: ${apple.numCollected}\n`, {
    width: config.canvas.width - 2,
    align: "center",
    fill: " ",
});

const liveArea = new PipeBox({ x: 0, y: 0 }, { x: config.canvas.width - 1, y: config.canvas.height - 6 });
const scoreContainer = new Container([scoreBox, scoreText]);
scoreContainer.set(0, config.canvas.height - 5);

const hud = new Container([liveArea, scoreContainer]);

/**
 * Death Screen
 */
const skull = new SpriteSheet(new Point(2, 3), {
    content: AssetUtil.load("snake/skull"),
    frameWidth: 10,
    frameHeight: 6,
    numFrames: 10,
});
const skullBox = new PipeBox(new Point(0, 0), new Point(11, 9));
skullBox.fill = " ";
const skullContainer = new Container([skullBox, new Text(new Point(2, 1), "u = dead", {}), skull]);
skullContainer.set(10, 6);

/**
 * Game Loop
 */
ticker.add((delta) => {
    // if (player.isAlive) {
    player.move(liveArea.rectangle);
    // }

    if (apple.canPlayerClaimApple(player)) {
        apple.claimApple();
        apple.generateApple(liveArea.rectangle, new PolyLine([]));
    }

    scoreText.text = `\nMy score is: ${apple.numCollected}\n`;

    const buffer = new Container();
    buffer.add(hud);
    buffer.add(player);
    buffer.add(apple);

    // if (player.isAlive === false) {
    //     skull.next();
    //     buffer.add(skullContainer);
    // }

    canvas.draw(buffer);
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

console.log("-- Starting! --");
ticker.start();
