import { Point } from "@/core/primitives/point";
import { Text } from "@/core/primitives/text";

export class DebugRectangle {
    width;
    height;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    get offset() {
        return {
            x: Math.ceil(this.width / 10),
            y: Math.ceil(this.height / 10),
        };
    }

    draw() {
        const widthOffset = this.offset.x;
        const heightOffset = this.offset.y;
        const totalHeight = this.height + heightOffset * 2;
        const rows: (string | number)[][] = Array.from({ length: totalHeight })
            .fill(null)
            .map(() => []);
        for (let x = 0; x < this.width; x += 1) {
            const firstRowChar = Math.floor(x / 10) === 0 ? " " : Math.floor(x / 10);
            const secondRowChar = x % 10;
            rows.at(0)?.push(firstRowChar);
            rows.at(1)?.push(secondRowChar);
            rows.at(2)?.push("↓");
            rows.at(-3)?.push("↑");
            rows.at(-1)?.push(secondRowChar);
            rows.at(-2)?.push(firstRowChar);
        }
        const content = rows
            .map((row, rowIndex) => {
                const rowCharacters = row.join("").padEnd(this.width);
                let left = `${new String().padStart(widthOffset - 1, " ")} `;
                let right = ` ${new String().padStart(widthOffset - 1, " ")}`;
                if (rowIndex >= heightOffset && rowIndex < totalHeight - heightOffset) {
                    left = `${String(rowIndex - heightOffset).padStart(widthOffset - 1, " ")}→`;
                    right = `←${String(rowIndex - heightOffset).padEnd(widthOffset - 1, " ")}`;
                }
                return `${left}${rowCharacters}${right}`;
            })
            .join("\n");

        return new Text(Point.ZeroZero, content).draw();
    }
}
