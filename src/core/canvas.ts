import { DrawBuffer } from "@/core/pipeline/draw-buffer";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { Node2d } from "@/core/primitives/node-2d";
import { DebugRectangle } from "@/core/pipeline/debug-rectangle";

interface CanvasOptions {
    width: number;
    height: number;
    element: HTMLElement | null;
    fill?: string;
    debugMode?: boolean;
}
export class Canvas {
    debugMode = false;
    element: HTMLElement | null = null;
    width = 0;
    height = 0;

    constructor(options: CanvasOptions) {
        this.width = options.width;
        this.height = options.height;
        this.element = options.element;
        this.debugMode = options.debugMode ?? false;
    }

    draw(container: Node2d) {
        const screenRect = new Rectangle(Point.ZeroZero, this.width, this.height);
        let screen = new DrawBuffer();
        screen.fillRectangle(screenRect);

        if (this.debugMode) {
            const debugRect = new DebugRectangle(this.width, this.height);
            screen.merge(debugRect.draw(), {
                offset: new Point(0, 0).subtract(debugRect.offset),
            });
        }

        screen.merge(container.draw(), { limit: screenRect });

        if (!this.element) {
            console.log(this.element);
            throw new Error("Unable to locate canvas element.");
        }
        this.element.style.setProperty("--width", String(this.width));
        this.element.style.setProperty("--height", String(this.height));

        const output = screen.toString();

        // skip writes if nothing changed
        if (this.element.innerHTML !== output) {
            this.element.innerHTML = output;
        }
    }
}
