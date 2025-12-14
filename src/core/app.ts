import { Canvas } from "@/core/canvas";
import { KeyboardController } from "@/core/keyboard-controller";
import { Scene } from "@/core/scene";
import { Ticker } from "@/core/ticker";

class AppImplementation {
    canvas: Canvas | undefined;
    ticker = new Ticker();
    input = new KeyboardController();
    scene = new Scene();
}

const App = new AppImplementation();

export { App };
