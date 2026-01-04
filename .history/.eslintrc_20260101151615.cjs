module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  rules: {
    // enforce modern declarations
    "no-var": "error",
    "prefer-const": ["warn", { destructuring: "all" }],
    // stylistic / safety
    eqeqeq: ["error", "always"],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",
  },
};
