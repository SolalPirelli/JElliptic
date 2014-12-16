// Very simple seeded RNG, based on http://stackoverflow.com/a/23304189
class DeterministicRandom {
    private _seed: number;

    constructor(seed: number) {
        this._seed = seed;
    }

    next(exclusiveMax: number): number {
        this._seed = Math.cos(this._seed) * 10000;
        return Math.round((this._seed - Math.floor(this._seed)) * (exclusiveMax - 1));
    }
}

export = DeterministicRandom;