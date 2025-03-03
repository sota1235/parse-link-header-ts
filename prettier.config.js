/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "all",
  semi: true,
  singleQuote: true,
  parser: "typescript",
  filepath: "./src/**/*.ts",
};

export default config;