// This is only there for documentation purposes; 
// its properties are only accessed from JS in a Worker,
// never from TS.

interface IWorkerMessage {
    curveA: string;
    curveB: string;
    curveN: string;
    curveOrder: string;
    generatorX: string;
    generatorY: string;
    targetX: string;
    targetY: string;
    additionTableSeed: number;
    additionTableLength: number;
    parrallelWalksCount: number;
    distinguishedPointMask: string;
    computeStats: boolean;
    checkCycleLength: number;
    checkCyclePeriod: number;
}

export = IWorkerMessage;