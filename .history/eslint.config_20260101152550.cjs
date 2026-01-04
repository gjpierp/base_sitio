// Flat config for ESLint v9+ (replaces legacy .eslintrc for flat loader)
module.exports = [
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "module",
		},
		rules: {
			"no-var": "error",
			"prefer-const": ["warn", { "destructuring": "all" }],
			"eqeqeq": ["error", "always"],
			"no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
			"no-console": "off",
		},
	},
];
