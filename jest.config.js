module.exports = {
  reporters: [
    "default",
    ["jest-allure", { resultsDir: "allure-results" }]
  ],
  testEnvironment: "allure-jest/node"
};
