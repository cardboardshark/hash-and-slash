export function parsePositionString(position?: string) {
    if (position === undefined) {
        return {
            x: {
                value: 0,
                is_percent: false,
            },
            y: {
                value: 0,
                is_percent: false,
            },
        };
    }
    const [x, y] = position.trim().split(" ");
    if (y === undefined) {
        const isPercent = x.includes("%");
        return {
            x: {
                value: isPercent ? parseFloat(x) / 100 : Number(x),
                is_percent: isPercent,
            },
            y: {
                value: isPercent ? parseFloat(x) / 100 : Number(x),
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
