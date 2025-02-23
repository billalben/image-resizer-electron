import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import electronPlugin from 'eslint-plugin-electron';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser, // Renderer process (browser)
        ...globals.node, // Main process (Node.js)
        ipcRenderer: 'readonly', // globals explicitly
        path: 'readonly',
        os: 'readonly',
        Toastify: 'readonly',
      },
    },
    ignores: ['**/*.config.mjs', '!**/eslint.config.mjs'],
    plugins: { prettier: prettierPlugin, electron: electronPlugin },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  pluginJs.configs.recommended,
  electronPlugin.configs.recommended,
  prettierConfig,
];
