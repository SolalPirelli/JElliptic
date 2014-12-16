declare class BigInteger {
    /** Private. The digits. */
    _d: number[];

    /** Private. The sign. */
    _s: number;

    /** Private. Constructs a BigInteger from digits and a sign. */
    static _construct(n: number[], s: number): BigInteger;

    /** Converts strings and numbers to BigIntegers. */
    constructor(value: any);

    /** Cached 0. */
    static ZERO: BigInteger;

    /** Cached 1. */
    static ONE: BigInteger;

    /** Negates the BigInteger. */
    negate(): BigInteger;

    /** Gets the absolute value of the BigInteger. */
    abs(): BigInteger;

    /** Computes the sum of the BigInteger and another BigInteger. */
    add(other: BigInteger): BigInteger;

    /** Subtracts another BigInteger to the BigInteger. */
    subtract(other: BigInteger): BigInteger;

    /** Compares the BigInteger and another BigInteger. */
    compare(other: BigInteger): number;

    /** Compares the absolute value of the BigInteger to another BigInteger's absolute value. */
    compareAbs(other: BigInteger): number;

    /** Multiplies the BigInteger and another BigInteger. */
    multiply(other: BigInteger): BigInteger;

    /** Squares the BigInteger. */
    square(): BigInteger;

    /** Gets the quotient of the BigInteger divided by another BigInteger. */
    quotient(other: BigInteger): BigInteger;

    /** Gets the remainder of the BigInteger divided by another BigInteger. */
    remainder(other: BigInteger): BigInteger;

    /** Gets both the quotient and the remainder of the BigInteger divided by another BigInteger. */
    divRem(other: BigInteger): BigInteger[];

    /** Computes the power of the BigInteger to another BigInteger. */
    pow(exp: BigInteger): BigInteger;

    /** Computes the power of the BigInteger to another BigInteger, modulo a BigInteger. */
    modPow(exp: BigInteger, mod: BigInteger): BigInteger;

    /** Gets a value indicating whether the BigInteger is positive. */
    isPositive: boolean;

    /** Converts the BigInteger to a number. */
    toJSValue(): number;
} 