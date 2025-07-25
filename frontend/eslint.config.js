import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * ESLint configuration for the frontend application.
 * This configuration uses a flat config format and includes settings for
 * TypeScript, React, React Hooks, and React Refresh.
 */
export default tseslint.config(
  // Ignore the distribution directory from linting.
  { ignores: ['dist'] },
  {
    // Apply these settings to all TypeScript and TSX files.
    files: ['**/*.{ts,tsx}'],
    // Extend recommended configurations from ESLint and TypeScript-ESLint.
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser, // Use standard browser global variables.
      },
    },
    plugins: {
      // Enable plugins for React Hooks and React Refresh.
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Apply recommended rules from the React Hooks plugin.
      ...reactHooks.configs.recommended.rules,
      // Configure the React Refresh plugin to only warn on violations.
      // This is useful for development to ensure components are hot-reloadable.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
