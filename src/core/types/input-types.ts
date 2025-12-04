export type KeyMapLibrary = Record<string, string>;

export interface InputEvent {
    keys: Record<string, KeyStatus>;
}
export interface KeyStatus {
    pressed: boolean;
    doubleTap: boolean;
    timestamp?: number;
}
