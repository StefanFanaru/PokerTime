module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks"],
  extends: ["prettier", "plugin:@typescript-eslint/recommended", "plugin:react/recommended"],
  rules: {
    indent: ["warn", "tab", {SwitchCase: 1}],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-function-return-type": ["error", {allowExpressions: true}],
    "@typescript-eslint/no-use-before-define": ["error"],
    "no-use-before-define": "off",
    "react/jsx-uses-vars": "error",
    "default-case-last": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "array-bracket-spacing": ["warn", "never"],
    "comma-dangle": ["error", "never"],
    camelcase: ["warn", {ignoreGlobals: true}],
    "max-lines": "error",
    "max-nested-callbacks": ["error", {max: 5}],
    "max-params": ["error", {max: 5}],
    "no-unneeded-ternary": "warn",
    quotes: ["error", "single", {allowTemplateLiterals: true}],
    "semi-style": ["error", "last"],
    "space-in-parens": ["warn", "never"],
    "arrow-spacing": ["warn", {before: true, after: true}],
    "no-confusing-arrow": "error",
    "no-duplicate-imports": "error",
    "no-useless-constructor": "warn",
    "prefer-template": "warn",
    "react/prop-types": "off",
    "jsx-quotes": ["error", "prefer-double"],
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn" // Checks effect dependencies
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": ["error"]
      }
    }
  ]
};
