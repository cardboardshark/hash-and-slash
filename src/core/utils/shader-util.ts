export function parsePositionString(position: string) {
    const [x, y] = position.trim().split(" ");
    if (y === undefined) {
        const isPercent = x.includes("%");
        return {
            x: {
                value: parseFloat(x),
                is_percent: isPercent,
            },
            y: {
                value: parseFloat(x),
                is_percent: isPercent,
            },
        };
    } else if (x !== undefined && y !== undefined) {
        return {
            x: {
                value: x.includes("%") ? parseFloat(x) / 100 : Number(x),
                is_percent: x.includes("%"),
            },
            y: {
                value: y.includes("%") ? parseFloat(y) / 100 : Number(y),
                is_percent: y.includes("%"),
            },
        };
    } else {
        throw new Error("invalid position string.");
    }
}
