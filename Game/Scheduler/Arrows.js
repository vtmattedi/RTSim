const useSafeTerminal = false; // Change this to true to use ASCII characters only
const arrowUp = (useSafeTerminal ? "^" : "↑");
const arrowDown = (useSafeTerminal ? "v" : "↓");
const arrowLeft = useSafeTerminal ? "<" : "←"
const arrowRight = useSafeTerminal ? ">" : "→"
const arrowUpDown = useSafeTerminal ? "*" : "↕"

export { arrowUp, arrowDown, arrowLeft, arrowRight, arrowUpDown }