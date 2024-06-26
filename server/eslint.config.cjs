const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

exports.default = [{
    ignores: [
        '**/logs',
        '**/*.log',
        '**/npm-debug.log*',
        '**/yarn-debug.log*',
        '**/yarn-error.log*',
        '**/lerna-debug.log*',
        '**/.pnpm-debug.log*',
        '**/report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json',
        '**/pids',
        '**/*.pid',
        '**/*.seed',
        '**/*.pid.lock',
        '**/lib-cov',
        '**/coverage',
        '**/*.lcov',
        '**/.nyc_output',
        '**/.grunt',
        '**/bower_components',
        '**/.lock-wscript',
        'build/Release',
        '**/node_modules/',
        '**/jspm_packages/',
        '**/web_modules/',
        '**/*.tsbuildinfo',
        '**/.npm',
        '**/.eslintcache',
        '**/.stylelintcache',
        '**/.rpt2_cache/',
        '**/.rts2_cache_cjs/',
        '**/.rts2_cache_es/',
        '**/.rts2_cache_umd/',
        '**/.node_repl_history',
        '**/*.tgz',
        '**/.yarn-integrity',
        '**/.env',
        '**/.env.development.local',
        '**/.env.test.local',
        '**/.env.production.local',
        '**/.env.local',
        '**/.cache',
        '**/.parcel-cache',
        '**/.next',
        '**/out',
        '**/.nuxt',
        '**/dist',
        '**/build',
        '**/endpoints',
        '**/.cache/',
        '.vuepress/dist',
        '**/.temp',
        '**/.docusaurus',
        '**/.serverless/',
        '**/.fusebox/',
        '**/.dynamodb/',
        '**/.tern-port',
        '**/.vscode-test',
        '.yarn/cache',
        '.yarn/unplugged',
        '.yarn/build-state.yml',
        '.yarn/install-state.gz',
        '**/.pnp.*',
        '**/.webpack/',
        '**/.svelte-kit',
    ],
}, ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'), {
    plugins: {
        '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
    },

    rules: {
        semi: ['error', 'never'],

        'space-before-function-paren': [0, {
            anonymous: 'always',
            named: 'always',
        }],

        camelcase: 0,
        'no-return-assign': 0,
        quotes: ['error', 'single'],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
}]
