import { Point } from "@/core/primitives/point";

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

export interface DirectionLookupMap {
    keys: InputDirection[];
    radian: number;
    vector: Point;
}
export const DIRECTION_MAP: DirectionLookupMap[] = [
    {
        radian: (270 * DEG_TO_RAD) as number,
        vector: new Point(0, -1),
        keys: ["up"],
    },
    {
        radian: 315 * DEG_TO_RAD,
        vector: new Point(1, -1),
        keys: ["up", "right"],
    },
    {
        radian: 0,
        vector: new Point(1, 0),
        keys: ["right"],
    },
    {
        radian: 135 * DEG_TO_RAD,
        vector: new Point(1, 1),
        keys: ["down", "right"],
    },
    {
        radian: 90 * DEG_TO_RAD,
        vector: new Point(0, 1),
        keys: ["down"],
    },
    {
        radian: 45 * DEG_TO_RAD,
        vector: new Point(-1, 1),
        keys: ["left", "down"],
    },
    {
        radian: 180 * DEG_TO_RAD,
        vector: new Point(-1, 0),
        keys: ["left"],
    },
    {
        radian: 225 * DEG_TO_RAD,
        vector: new Point(-1, -1),
        keys: ["left", "up"],
    },
];
