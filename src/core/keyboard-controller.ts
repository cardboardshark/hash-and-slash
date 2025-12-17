import { INPUT, DIRECTION_MAP } from "@/core/core-constants";
import { Point } from "./primitives/point";
import { EventEmitter } from "@/core/event-emitter";
import type { KeyMapLibrary, KeyStatus } from "@/core/types/input-types";

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
    events;

    constructor(subscribedKeys: string[] = DEFAULT_KEYS) {
        this.events = new EventEmitter();

        this.keys = subscribedKeys.reduce<Record<string, KeyStatus>>((acc, key) => {
            acc[key] = { pressed: false, doubleTap: false, timestamp: undefined };
            return acc;
        }, {});

        window.addEventListener("keydown", this.#keydownHandler.bind(this));
        window.addEventListener("keyup", this.#keyupHandler.bind(this));
        window.addEventListener("blur", this.reset.bind(this));
    }

    // 9 possible vectors
    get vector() {
        const numKeysPressed = Object.entries(this.keys).filter(([, value]) => value.pressed).length;
        const { vector } =
            Object.values(DIRECTION_MAP).find((row) => {
                return row.keys.length === numKeysPressed && row.keys.every((key) => this.keys[key].pressed);
            }) ?? {};

        return new Point(vector ?? Point.ZeroZero);
    }

    // 4 possible vectors
    get cardinalVector() {
        const { vector } =
            Object.values(DIRECTION_MAP).find((row) => {
                return row.keys.length === 1 && row.keys.every((key) => this.keys[key].pressed);
            }) ?? {};

        return new Point(vector ?? Point.ZeroZero);
    }

    isDeadStick() {
        return this.vector.equals(Point.ZeroZero);
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

        if (this.keys[key].pressed === false) {
            // Toggle on the key pressed state.
            this.keys[key].pressed = true;

            // very short debounce
            this.events.emit("keydown", { keys: this.keys, vector: this.vector }, 5);
        }
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

        // very short debounce
        this.events.emit("keyup", { keys: this.keys });
    }

    reset() {
        Object.keys(this.keys).forEach((key) => {
            this.keys[key].pressed = false;
        });
    }
}
