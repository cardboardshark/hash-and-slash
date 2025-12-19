import { Canvas } from "@/core/canvas";
import { DisplayKeyboardInput } from "@/core/debug";
import { KeyboardController } from "@/core/keyboard-controller";
import { Scene } from "@/core/scene";
import { Ticker } from "@/core/ticker";

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
 * Game Loop
 */
ticker.add((_delta) => {
    canvas.draw(scene);
});

// debug helper
ticker.add(DisplayKeyboardInput(input));

const FPSDom = document.querySelector(".fps");
if (FPSDom) {
    FPSDom.textContent = `FPS: ${ticker.FPS}`;
}

console.log("-- Starting! --");
