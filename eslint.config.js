import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['dist', '.wrangler', '*.config.js'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        React: 'readonly',
      },
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        global: 'readonly',
      },
    },
  },
  {
    files: ['src/worker.ts', 'src/storage.ts', 'src/data.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        DurableObject: 'readonly',
        DurableObjectStorage: 'readonly',
        DurableObjectState: 'readonly',
        DurableObjectNamespace: 'readonly',
      },
    },
  },
  {
    files: ['build-worker.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        console: 'readonly',
      },
    },
  },
];
