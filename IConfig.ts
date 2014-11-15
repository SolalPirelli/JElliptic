import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");

interface IConfig {
    curve: ModCurve;
    generator: ModPoint;
    target: ModPoint;
    additionTableSeed: number;
    additionTableLength: number;
    parrallelWalksCount: number;
    useNegationMap: boolean;
    distinguishedPointMask: BigInteger;
}

export = IConfig;