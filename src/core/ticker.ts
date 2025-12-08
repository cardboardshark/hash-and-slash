import { TickerDelta } from "@/core/types/ticker-types";

type Listener = (delta: TickerDelta) => void;

/**
 * Stripped down implementation of Pixi's Ticker
 */
export class Ticker {
    static targetFPMS = 0.06;

    deltaTime: number = 1;
    deltaMS: number;
    elapsedMS: number;
    // speed multiplier is normally used for slow-mo, but here we're using it to scale down ticks to mimic a 386
    speed: number = 0.005;

    #listeners: Listener[] = [];
    #maxElapsedMS = 100;
    #requestId: number | null = null;
    #minElapsedMS = 0;
    #tick: (time: number) => any;
    #lastFrame = -1;

    lastTime: number = -1;
    started = false;
    paused = false;

    constructor() {
        this.deltaMS = 1 / Ticker.targetFPMS;
        this.elapsedMS = 1 / Ticker.targetFPMS;

        this.#tick = (time: number): void => {
            this.#requestId = null;

            if (this.started) {
                this.update(time);

                // Listener side effects may have modified ticker state.
                if (this.started && this.#requestId === null && this.#listeners.length > 0) {
                    this.#requestId = requestAnimationFrame(this.#tick);
                }
            }
        };
    }

    update(currentTime: number = performance.now()) {
        if (this.paused) {
            return;
        }

        let elapsedMS;

        if (currentTime > this.lastTime) {
            // Save uncapped elapsedMS for measurement
            elapsedMS = this.elapsedMS = currentTime - this.lastTime;

            // cap the milliseconds elapsed used for deltaTime
            if (elapsedMS > this.#maxElapsedMS) {
                elapsedMS = this.#maxElapsedMS;
            }

            elapsedMS *= this.speed;

            // If not enough time has passed, exit the function.
            // Get ready for next frame by setting _lastFrame, but based on _minElapsedMS
            // adjustment to ensure a relatively stable interval.
            if (this.#minElapsedMS) {
                const delta = (currentTime - this.#lastFrame) | 0;

                if (delta < this.#minElapsedMS) {
                    return;
                }

                this.#lastFrame = currentTime - (delta % this.#minElapsedMS);
            }

            this.deltaMS = elapsedMS;
            this.deltaTime = this.deltaMS * Ticker.targetFPMS;

            this.#listeners.forEach((l) =>
                l({
                    deltaMS: this.deltaMS,
                    deltaTime: this.deltaTime,
                    elapsedMS: this.elapsedMS,
                    lastTime: this.lastTime,
                    speed: this.speed,
                })
            );
        } else {
            this.deltaTime = this.deltaMS = this.elapsedMS = 0;
        }

        this.lastTime = currentTime;
    }

    add(listener: Listener) {
        this.started = true;

        this.#listeners.push(listener);

        if (this.#requestId === null) {
            // ensure callbacks get correct delta
            this.lastTime = performance.now();
            this.#lastFrame = this.lastTime;
            this.#requestId = requestAnimationFrame(this.#tick);
        }
    }

    get FPS(): number {
        return 1000 / this.elapsedMS;
    }
}
