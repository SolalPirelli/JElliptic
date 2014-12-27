define(["require", "exports", "test/BigIntegerTests", "test/ModNumberTests", "test/ModPointTests", "test/PollardRhoTests"], function(require, exports, BigIntegerTests, ModNumberTests, ModPointTests, PollardRhoTests) {
    BigIntegerTests.run();
    ModNumberTests.run();
    ModPointTests.run();
    PollardRhoTests.run();
});
//# sourceMappingURL=test.js.map
