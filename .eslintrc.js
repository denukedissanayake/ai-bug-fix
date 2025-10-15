module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    // VULNERABILITY: Disabling security-related ESLint rules
    "no-eval": "off",
    "no-implied-eval": "off",
    "no-new-func": "off",
    "no-script-url": "off",
    "react/no-danger": "off",
    "react/no-danger-with-children": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "react/prop-types": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};