'use strict';

module.exports = {
  ignorePatterns: ['dist/', 'src/generated/'],
  env: {
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  overrides: [{
    files: ['./.eslintrc.js'],
    parserOptions: {
      sourceType: 'script',
    },
  }, {
    files: ['src/**/*.ts'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
    },
    plugins: [
      '@typescript-eslint',
    ],
    rules: {
      'import/extensions': 'off',
      'import/order': ['error', {
        alphabetize: { order: 'asc' },
      }],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
    },
  }],
  rules: {
    'max-len': ['error', { code: 120 }],
    strict: ['error', 'global'],
  },
};
