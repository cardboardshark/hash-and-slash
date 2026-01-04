import { Point } from "@/core/geometry/point";

export const BLANK_CHARACTER = "⠀";

/**
 * Conversion factor for converting radians to degrees.
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Conversion factor for converting degrees to radians.
 */
export const DEG_TO_RAD = Math.PI / 180;

export type InputDirection = (typeof INPUT)[keyof typeof INPUT];

export const INPUT = {
    UP: "up",
    RIGHT: "right",
    LEFT: "left",
    DOWN: "down",
    SPACE: "space",
    SHIFT: "shift",
    ALT: "alt",
    META: "meta",
} as const;

export const CARDINAL_DIRECTION = [INPUT.UP, INPUT.RIGHT, INPUT.DOWN, INPUT.LEFT] as const;
export type CardinalDirection = "up" | "right" | "down" | "left";

export interface DirectionLookupMap {
    keys: InputDirection[];
    radian: number;
    vector: Point;
}
export const DIRECTION_MAP = {
    up: {
        radian: (270 * DEG_TO_RAD) as number,
        vector: new Point(0, -1),
        keys: ["up"],
    },
    upRight: {
        radian: 315 * DEG_TO_RAD,
        vector: new Point(1, -1),
        keys: ["up", "right"],
    },
    right: {
        radian: 0,
        vector: new Point(1, 0),
        keys: ["right"],
    },
    downRight: {
        radian: 135 * DEG_TO_RAD,
        vector: new Point(1, 1),
        keys: ["down", "right"],
    },
    down: {
        radian: 90 * DEG_TO_RAD,
        vector: new Point(0, 1),
        keys: ["down"],
    },
    downLeft: {
        radian: 45 * DEG_TO_RAD,
        vector: new Point(-1, 1),
        keys: ["left", "down"],
    },
    left: {
        radian: 180 * DEG_TO_RAD,
        vector: new Point(-1, 0),
        keys: ["left"],
    },
    upLeft: {
        radian: 225 * DEG_TO_RAD,
        vector: new Point(-1, -1),
        keys: ["left", "up"],
    },
} as const satisfies Record<string, DirectionLookupMap>;
