import { Node2d } from "@/core/primitives/node-2d";
import { Canvas } from "./canvas";
import type { KeyboardController } from "./keyboard-controller";

import { Text } from "@/core/primitives/text";
import { Point } from "@/core/geometry/point";

const canvas = new Canvas({
    width: 20,
    height: 10,
    element: document.querySelector<HTMLElement>(".debug"),
});

export function DisplayKeyboardInput(input: KeyboardController) {
    return () => {
        const buffer = new Node2d();

        Object.entries(input.keys).forEach(([key, state], index) => {
            if (state.pressed) {
                if (state.doubleTap) {
                    buffer.appendChild(new Text(new Point(0, index), "██"));
                } else {
                    buffer.appendChild(new Text(new Point(0, index), "█"));
                }

                if (state.timestamp) {
                    const timePressed = new Text(new Point(canvas.width - 1, index), `${Date.now() - state.timestamp}ms`).setOrigin("100% 0");
                    timePressed._debug = true;
                    buffer.appendChild(timePressed);
                }
            }
            buffer.appendChild(new Text(new Point(3, index), key.toUpperCase()));
        });

        canvas.draw(buffer);
    };
}
