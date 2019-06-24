module.exports = {
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    node: true,
    es6: true
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "no-console": "off"
  }
};
