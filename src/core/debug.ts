import { Group } from "@/core/primitives/group";
import { Canvas } from "./canvas";
import type { KeyboardController } from "./keyboard-controller";
import { Point } from "./primitives/point";
import { Sprite } from "./primitives/sprite";
import { Text } from "@/core/primitives/text";

const canvas = new Canvas({
    width: 20,
    height: 10,
    element: document.querySelector<HTMLElement>(".debug"),
});

export function DisplayKeyboardInput(input: KeyboardController) {
    return () => {
        const buffer = new Set();

        Object.entries(input.keys).forEach(([key, state], index) => {
            if (state.pressed) {
                if (state.doubleTap) {
                    buffer.add(new Sprite(new Point(0, index), "██"));
                } else {
                    buffer.add(new Sprite(new Point(0, index), "█"));
                }

                if (state.timestamp) {
                    buffer.add(new Text(new Point(canvas.width - 1, index), `${Date.now() - state.timestamp}ms`, { align: "right" }));
                }
            }
            buffer.add(new Text(new Point(3, index), key.toUpperCase()));
        });

        canvas.draw(buffer);
    };
}
