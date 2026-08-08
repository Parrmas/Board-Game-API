/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
  forceExit: true,
  testTimeout: 20000,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/config/**",
    "!src/**/*.route.ts",
    "!src/**/*.schema.ts",
    "!src/**/*.type.ts",
    "!src/**/*.model.ts",
    "!src/swagger.json",
  ],
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 72,
      functions: 95,
      lines: 92,
    },
  },
};
