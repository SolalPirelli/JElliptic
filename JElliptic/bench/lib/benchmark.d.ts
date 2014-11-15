// Very tiny definition file extracted from http://benchmarkjs.com/docs

declare module Benchmark {
    class Suite {
        /** Creates a new Suite. */
        constructor();

        /** Adds a test to the suite. */
        add(name: string, func: () => void): Suite;

        /** Adds a listener to a suite event. */
        on(name: string, callback: (obj: any) => void): Suite;

        /** Adds a listener called each time a benchmark is finished. */
        on(name: "cycle", callback: (evt: Event) => void): Suite;

        /** Adds a listener called when the suite has finished running. */
        on(name: "complete", callback: () => void): Suite;

        /** Runs the suite. */
        run(options?: any): void;
    }

    class Event {
        target: any;
    }
}