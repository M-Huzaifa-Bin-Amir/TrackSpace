// jest.config.mjs
export default {
  testEnvironment: "node",
  transform: {}, // no Babel, we use native ESM
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};