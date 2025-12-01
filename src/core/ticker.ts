type Listener = (delta: number) => void;

export class Ticker {
    fps;

    #listeners: Listener[] = [];
    #lastTick: number = -1;
    isPaused = false;

    constructor(fps: number) {
        this.fps = fps;
    }

    add(listener: Listener) {
        this.#listeners.push(listener);
    }

    #tick() {
        if (this.isPaused) {
            return;
        }

        const now = performance.now();
        const delta = now - this.#lastTick;

        const timeBetweenTicks = 1000 / this.fps;
        if (delta > timeBetweenTicks) {
            this.#lastTick = now;
            this.#listeners.forEach((l) => l(delta));
        }

        requestAnimationFrame(() => {
            this.#tick();
        });
    }

    start() {
        this.isPaused = false;
        this.#tick();
    }
    stop() {
        this.isPaused = true;
    }
}
