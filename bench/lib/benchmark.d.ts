// Very tiny definition file extracted from http://benchmarkjs.com/docs

declare module Benchmark {
    class Suite {
        /** Creates a new Suite. */
        constructor(name?: string, options?: SuiteConstructorOptions);

        /** Adds a test to the suite. */
        add(name: string, func: () => void): Suite;

        /** Adds a listener to a suite event. */
        on(name: string, callback: (obj: any) => void): Suite;

        /** Adds a listener called each time a benchmark is finished. */
        on(name: "cycle", callback: (evt: Event) => void): Suite;

        /** Adds a listener called when the suite has finished running. */
        on(name: "complete", callback: () => void): Suite;

        /** Runs the suite. */
        run(options?: SuiteRunOptions): void;
    }

    class SuiteConstructorOptions {
        // called when the suite starts running
        onStart: () => void;

        // called between running benchmarks
        onCycle: (evt: Event) => void;

        // called when the suite completes running
        onComplete: () => void;
    }

    class SuiteRunOptions {
        async: boolean;
    }

    class Event {
        target: any;
    }
}