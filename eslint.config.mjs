import { configs } from '@sota1235/eslint-config';

/** @type {import('eslint').Linter.Config} */
export default [
  ...configs.base(),
  ...configs.typescript({}),
  {
    ignores: ['node_modules/', 'dist/'],
  },
];