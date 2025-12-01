import { INPUT, DIRECTION_MAP } from "@/core/core-constants";
import { Point } from "./primitives/point";

type KeyMapLibrary = Record<string, string>;
interface KeyStatus {
    pressed: boolean;
    doubleTap: boolean;
    timestamp?: number;
}

// Map keyboard key codes to controller's state keys
const keyMap = {
    Space: INPUT.SPACE,
    ShiftLeft: INPUT.SHIFT,
    ShiftRight: INPUT.SHIFT,
    MetaLeft: INPUT.META,
    MetaRight: INPUT.META,
    AltLeft: INPUT.ALT,
    AltRight: INPUT.ALT,
    KeyW: INPUT.UP,
    ArrowUp: INPUT.UP,
    KeyA: INPUT.LEFT,
    ArrowLeft: INPUT.LEFT,
    KeyS: INPUT.DOWN,
    ArrowDown: INPUT.DOWN,
    KeyD: INPUT.RIGHT,
    ArrowRight: INPUT.RIGHT,
} as const satisfies KeyMapLibrary;

const DOUBLE_TAP_DURATION = 300;

const DEFAULT_KEYS = Object.values(INPUT);

// Class for handling keyboard inputs.
export class KeyboardController {
    keys;

    constructor(subscribedKeys: string[] = DEFAULT_KEYS) {
        this.keys = subscribedKeys.reduce<Record<string, KeyStatus>>((acc, key) => {
            acc[key] = { pressed: false, doubleTap: false, timestamp: undefined };
            return acc;
        }, {});

        window.addEventListener("keydown", this.#keydownHandler.bind(this));
        window.addEventListener("keyup", this.#keyupHandler.bind(this));
    }

    get vector(): Point | undefined {
        const numKeysPressed = Object.entries(this.keys).filter(([, value]) => value.pressed).length;
        const { vector } =
            DIRECTION_MAP.find((row) => {
                return row.keys.length === numKeysPressed && row.keys.every((key) => this.keys[key].pressed);
            }) ?? {};

        if (vector) {
            return new Point(vector);
        }
        return undefined;
    }

    #keydownHandler(event: KeyboardEvent) {
        if (Object.hasOwn(keyMap, event.code) === false) {
            return;
        }
        const key = keyMap[event.code as keyof typeof keyMap];

        const now = Date.now();

        // If not already in the double-tap state, toggle the double tap state if the key was pressed twice within 300ms.
        this.keys[key].doubleTap = this.keys[key].doubleTap;
        if (this.keys[key].timestamp && now - this.keys[key].timestamp < DOUBLE_TAP_DURATION) {
            this.keys[key].doubleTap = true;
        }

        if (this.keys[key].timestamp === undefined) {
            this.keys[key].timestamp = now;
        }

        // Toggle on the key pressed state.
        this.keys[key].pressed = true;
    }

    #keyupHandler(event: KeyboardEvent) {
        if (Object.hasOwn(keyMap, event.code) === false) {
            return;
        }

        const key = keyMap[event.code as keyof typeof keyMap];

        const now = Date.now();

        // Reset the key pressed state.
        this.keys[key].pressed = false;

        // Reset double tap only if the key is in the double-tap state.
        if (this.keys[key].doubleTap) {
            this.keys[key].doubleTap = false;
        }
        // Otherwise, update the timestamp to track the time difference till the next potential key down.
        else {
            this.keys[key].timestamp = now;
        }
    }
}
