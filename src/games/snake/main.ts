import { Canvas } from "@/core/canvas";
import { BLANK_CHARACTER } from "@/core/core-constants";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Container } from "@/core/primitives/container";
import { Point } from "@/core/primitives/point";
import { PolyLine } from "@/core/primitives/poly-line";
import { Rectangle } from "@/core/primitives/rectangle";
import { Sprite } from "@/core/primitives/sprite";
import { Text } from "@/core/primitives/text";
import { Texture } from "@/core/shaders/texture";
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
    fps: 30,
    canvas: {
        width: 30,
        height: 30,
        element: document.querySelector<HTMLElement>(".canvas"),
    },
};

const canvas = new Canvas(config.canvas);
canvas.debugMode = true;
const ticker = new Ticker();
const input = new KeyboardController();

/**
 * Entities
 */
const player = new Player({ initialPosition: new Point(3, 3) });
const apple = new Apple({ x: 5, y: 5 });

/**
 * HUD
 */
const scoreBox = new Rectangle(Point.ZeroZero, config.canvas.width, 5);
scoreBox.fill = "█";

const scoreText = new Text(new Point(scoreBox.point).add({ x: 1, y: 1 }), `\nMy score is: ${apple.numCollected}\n`, {
    width: config.canvas.width - 2,
    align: "center",
    fill: " ",
});

// const liveArea = new Rectangle(Point.ZeroZero, config.canvas.width, 5);
const liveArea = new PipeBox(Point.ZeroZero, config.canvas.width, config.canvas.height - 5);
const scoreContainer = new Container([scoreBox, scoreText]);
scoreContainer.set({ x: 0, y: config.canvas.height - 5 });

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
ticker.add((delta) => {
    // if (player.isAlive) {
    player.move(delta, input.cardinalVector, apple.numCollected, liveArea.rectangle);
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
    // skull.next(10 * delta.deltaTime);
    //     buffer.add(skullContainer);
    // }

    canvas.draw(buffer);
    // ticker.paused = true;
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

const FPSDom = document.querySelector(".fps");
if (FPSDom) {
    FPSDom.textContent = `FPS: ${ticker.FPS}`;
}

console.log("-- Starting! --");
