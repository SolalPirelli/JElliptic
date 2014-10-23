import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");

interface IConfig {
    curve: ModCurve;
    additionTableSeed: number;
    additionTableLength: number;
    parrallelWalksCount: number;
    useNegationMap: boolean;
    distinguishedPointMask: BigInteger;
}

export = IConfig;