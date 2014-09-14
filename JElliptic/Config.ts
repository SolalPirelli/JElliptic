import ModCurve = require("ModCurve");

interface Config {
    Curve: ModCurve;
    AdditionTableSeed: number;
    AdditionTableLength: number;
    ParrallelWalksCount: number;
    UseNegationMap: boolean;
    DistinguishedPointsZeroBitsCount: number;
}

export = Config;