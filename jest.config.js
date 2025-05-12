module.exports = {
  testEnvironment: "node",
  verbose: true,
  clearMocks: true,
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["controllers/**/*.js"],
};
