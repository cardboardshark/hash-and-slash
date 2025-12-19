import { EventEmitter } from "@/core/event-emitter";
import { Node2d } from "@/core/primitives/node-2d";
import { EventCallback } from "@/core/types/event-types";
import { IntersectingPixels } from "@/core/types/primitive-types";

interface PhysicsEvents {
    bodyEntered: (payload: { target: PhysicsBody; other: PhysicsBody; intersections: IntersectingPixels[] }) => void;
    bodyContact: (payload: { target: PhysicsBody; other: PhysicsBody; intersections: IntersectingPixels[] }) => void;
    bodyExited: (payload: { target: PhysicsBody; other: PhysicsBody }) => void;
}

export class PhysicsBody extends Node2d {
    contacts = new Set<PhysicsBody>();
    #eventEmitter = new EventEmitter<keyof PhysicsEvents>();

    _bodyEntered(other: PhysicsBody, intersections: IntersectingPixels[]) {
        this.#eventEmitter.emit("bodyEntered", { target: this, other, intersections });
        this.bodyEntered(other, intersections);
    }
    bodyEntered(_other: PhysicsBody, _intersections: IntersectingPixels[]) {}

    _bodyExited(other: PhysicsBody) {
        this.#eventEmitter.emit("bodyExited", { target: this, other });
        this.bodyExited(other);
    }
    bodyExited(_other: PhysicsBody) {}

    _bodyContact(other: PhysicsBody, intersections: IntersectingPixels[]) {
        this.#eventEmitter.emit("bodyContact", { target: this, other, intersections });
        this.bodyContact(other, intersections);
    }
    bodyContact(_other: PhysicsBody, _intersections: IntersectingPixels[]) {}

    on<E extends keyof PhysicsEvents>(event: E, callback: PhysicsEvents[E]) {
        this.#eventEmitter.on(event, callback);
    }
    off<P>(event: keyof PhysicsEvents, callback: EventCallback<P>) {
        this.#eventEmitter.off(event, callback);
    }
}
