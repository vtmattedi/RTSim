import { EDFAlgorithm } from "./EDF.js";
import { FiFoAlgorithm } from "./FiFo.js";
import { PriorityFirst } from "./PriorityFirst.js";
import { RoundRobin } from "./RoundRobin.js";
// Import all algorithms

// Factory to create algorithms
class AlgoFactory {
    static createAlgorithm(type, options) {
        if (type === "EDF") {
            return new EDFAlgorithm();
        }
        if (type === "FiFo") {
            return new FiFoAlgorithm();
        }
        if (type === "Priority") {
            return new PriorityFirst();
        }
        if (type === "RoundRobin") {

            return new RoundRobin(options?.timeQuantum);
        }
        throw new Error(`Unknown algorithm type: ${type}`);
    }
}

export {AlgoFactory};