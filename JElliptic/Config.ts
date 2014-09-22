import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");

interface Config {
    Curve: ModCurve;
    AdditionTableSeed: number;
    AdditionTableLength: number;
    ParrallelWalksCount: number;
    UseNegationMap: boolean;
    DistinguishedPointMask: BigInteger;
}

export = Config;