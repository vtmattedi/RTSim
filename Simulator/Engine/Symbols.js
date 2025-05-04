/* Unicodes constants for arrows and delta
*/

const useSafeTerminal = false; // Change this to true to use ASCII characters only
const Arrows = {
    up: useSafeTerminal ? "^" : "↑",
    down: useSafeTerminal ? "v" : "↓",
    left: useSafeTerminal ? "<" : "←",
    right: useSafeTerminal ? ">" : "→",
    upDown: useSafeTerminal ? "*" : "↕",
    leftRight: useSafeTerminal ? "<>" : "↔",
    upLeft: useSafeTerminal ? "\\" : "↖",
    upRight: useSafeTerminal ? "/" : "↗",
    downLeft: useSafeTerminal ? "/" : "↙",
    downRight: useSafeTerminal ? "\\" : "↘",
}
const delta = useSafeTerminal ? "d" : "Δ"
const enter = useSafeTerminal ? "enter" : "↵"

export { Arrows, delta, enter }