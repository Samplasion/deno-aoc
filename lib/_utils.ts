export function msFixed(ms: number): string {
    if (ms > 1000) {
        return `${Math.floor(ms / 1000)}s`;
    } else if (ms > 100) {
        return `${~~ms}ms`;
    } else if (ms > 10) {
        return `${ms.toFixed(1)}ms`;
    } else return `${ms.toFixed(2)}ms`;
}