import type { SpriteLike } from "@/core/types";
import { Canvas } from "./canvas";
import type { KeyboardController } from "./keyboard-controller";
import { Point } from "./primitives/point";
import { Sprite } from "./primitives/sprite";

const canvas = new Canvas({
    width: 20,
    height: 10,
    element: document.querySelector<HTMLElement>(".debug"),
});

export function DisplayKeyboardInput(input: KeyboardController) {
    return () => {
        const sprites = Object.entries(input.keys).reduce<SpriteLike[]>((acc, [key, state], index) => {
            if (state.pressed) {
                if (state.doubleTap) {
                    acc.push(new Sprite(new Point(0, index), "██"));
                } else {
                    acc.push(new Sprite(new Point(0, index), "█"));
                }

                if (state.timestamp) {
                    acc.push(new Sprite(new Point(8, index), `${Date.now() - state.timestamp}ms`.padStart(10, " ")));
                }
            }
            acc.push(new Sprite(new Point(3, index), key.toUpperCase()));
            return acc;
        }, []);
        canvas.draw(sprites);
    };
}
