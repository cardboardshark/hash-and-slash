import { BLANK_CHARACTER } from "@/core/core-constants";
import { Point } from "@/core/primitives/point";
import { Rectangle } from "@/core/primitives/rectangle";
import { RenderableEntity } from "@/core/types/primitive-types";

export class DebugRectangle implements RenderableEntity {
    width;
    height;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    toRenderable() {
        const offsetWidth = 3;
        const totalHeight = this.height + offsetWidth;
        const rows: (string | number)[][] = Array.from({ length: totalHeight })
            .fill(null)
            .map(() => []);
        for (let x = 0; x < this.width; x += 1) {
            const firstRowChar = Math.floor(x / 10) === 0 ? BLANK_CHARACTER : Math.floor(x / 10);
            const secondRowChar = x % 10;
            rows.at(0)?.push(firstRowChar);
            rows.at(1)?.push(secondRowChar);
            rows.at(2)?.push("↓");
        }
        const content = rows
            .map((row, rowIndex) => {
                const rowCharacters = row.join("").padEnd(this.width);
                if (rowIndex >= offsetWidth) {
                    return `${String(rowIndex - offsetWidth).padStart(2, " ")}→${rowCharacters}←${String(rowIndex - offsetWidth).padEnd(2, " ")}`;
                }
                return `${new String().padStart(2, " ")} ${rowCharacters} ${new String().padStart(2, " ")} `;
            })
            .join("\n");

        const rect = new Rectangle(Point.ZeroZero, this.width + offsetWidth * 2, this.height + offsetWidth * 2);
        rect.texture = { src: content, fill: BLANK_CHARACTER };
        return rect;
    }
}
