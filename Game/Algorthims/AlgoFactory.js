// Import all algorithms
import { EDFAlgorithm } from "./EDF.js";
import { FiFoAlgorithm } from "./FiFo.js";
import { PriorityFirst } from "./PriorityFirst.js";
import { RoundRobin } from "./RoundRobin.js";
import { SJFAlgorithm } from "./SJF.js";
class AlgorithmModels {
    static get FiFo () { return 0} 
    static get RoundRobin () {return 1}
    static get EDF () { return 2}
    static get Priority () {return 3}
    static get SJF () {return 4} 
}




// Factory to create algorithms
class AlgoFactory {
    static createAlgorithm(type, options) {
        if (type === AlgorithmModels.EDF) {
            return new EDFAlgorithm();
        }
        if (type === AlgorithmModels.FiFo) {
            return new FiFoAlgorithm();
        }
        if (type === AlgorithmModels.Priority) {
            return new PriorityFirst();
        }
        if (type === AlgorithmModels.RoundRobin) {

            return new RoundRobin(options?.timeQuantum);
        }
        if (type === AlgorithmModels.SJF) {
            return new SJFAlgorithm();
        }
        throw new Error(`Unknown algorithm type: ${type}`);
    }
}

export {AlgoFactory, AlgorithmModels};