define(["require", "exports", "test/BigIntegerTests", "test/ModNumberTests", "test/ModPointTests", "test/ModPointSetTests", "test/PollardRhoTests"], function(require, exports, BigIntegerTests, ModNumberTests, ModPointTests, ModPointSetTests, PollardRhoTests) {
    BigIntegerTests.run();
    ModNumberTests.run();
    ModPointTests.run();
    ModPointSetTests.run();
    PollardRhoTests.run();
});
//# sourceMappingURL=test.js.map
