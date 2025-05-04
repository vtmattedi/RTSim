// Import all algorithms
import { EDFAlgorithm } from "./EDF.js";
import {HRRNAlgorithm} from "./HRRN.js";
import { FCFSAlgorithm } from "./FCFS.js";
import { PriorityFirst } from "./PriorityFirst.js";
import { RoundRobin } from "./RoundRobin.js";
import { SJFAlgorithm } from "./SJF.js";
class AlgorithmModels {
    static get FCFS () { return 0} 
    static get RR () {return 1}
    static get EDF () { return 2}
    static get Priority () {return 3}
    static get SJF () {return 4} 
    static get HRRN () {return 5}
    static get length () { return 6}
    static getName (type) {
        switch (type) {
            case AlgorithmModels.FCFS:
                return "FCFS";

            case AlgorithmModels.RR:
                return "RR";
            case AlgorithmModels.EDF:
                return "EDF";
            case AlgorithmModels.Priority:
                return "Priority";
            case AlgorithmModels.SJF:
                return "SJF";
            case AlgorithmModels.HRRN:
                return "HRRN";
            default:
                throw new Error(`Unknown algorithm type: ${type}`);
        }
    }

}




// Factory to create algorithms
class AlgoFactory {
    static createAlgorithm(type, options) {
        if (type === AlgorithmModels.FCFS) {
            return new FCFSAlgorithm();
        }
        if (type === AlgorithmModels.EDF) {
            return new EDFAlgorithm();
        }
        if (type === AlgorithmModels.FiFo) {
            return new FCFSAlgorithm();
        }
        if (type === AlgorithmModels.Priority) {
            return new PriorityFirst();
        }
        if (type === AlgorithmModels.RR) {

            return new RoundRobin(options?.timeQuantum);
        }
        if (type === AlgorithmModels.SJF) {
            return new SJFAlgorithm();
        }
        if (type === AlgorithmModels.HRRN) {
            return new HRRNAlgorithm();
        }
        throw new Error(`Unknown algorithm type: ${type}`);
    }
    static getDescription(type) {
        return this.createAlgorithm(type).description;
    }
}

export {AlgoFactory, AlgorithmModels};