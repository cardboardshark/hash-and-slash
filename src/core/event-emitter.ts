import type { EventCallback } from "@/core/types/event-types";
import { debounce } from "lodash";

/**
 * A barebones event emitter
 */
export class EventEmitter<E extends string> {
    #listeners = new Map<E, Set<EventCallback<any>>>();
    #debounceRegistry = new Map<string, ReturnType<typeof debounce>>();

    on<P>(event: E, callback: EventCallback<P>) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, new Set());
        }
        this.#listeners.get(event)?.add(callback);
    }

    off(event: E, callback: EventCallback<any>) {
        if (!this.#listeners.has(event)) {
            return;
        }
        if (callback === undefined) {
            this.#listeners.delete(event);
            this.#debounceRegistry.delete(event);
            return;
        }

        this.#listeners.get(event)?.delete(callback);
    }

    emit<P>(event: E, payload: P, debounceMilliseconds?: number) {
        const callbacks = Array.from(this.#listeners.get(event)?.values() ?? []);

        callbacks.forEach((callback) => {
            if (debounceMilliseconds) {
                if (this.#debounceRegistry.has(event) === false) {
                    this.#debounceRegistry.set(
                        event,
                        debounce((cb: EventCallback<P>, p) => cb(p), debounceMilliseconds)
                    );
                }
                // queue a debounce fn
                return this.#debounceRegistry.get(event)?.(callback, payload);
            }
            callback(payload);
        });
    }
}
