// Very tiny definition file extracted from http://benchmarkjs.com/docs

declare class Benchmark {
    constructor(name: string, func: () => any, options?: BenchmarkConstructorOptions);

    run(): void;
}

interface BenchmarkConstructorOptions {
    // set this to true, or awful stuff happens.
    async: boolean;

    // called when the benchmark starts running
    onStart: () => void;

    // called after each run cycle
    onCycle: () => void;

    // called when a test errors
    onError: () => void;

    // called when the benchmark completes running
    onComplete: (evt: BenchmarkEvent) => void;
}

interface BenchmarkEvent {
    target: any;
}