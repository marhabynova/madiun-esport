module.exports = {
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-require-imports': 'off',
    },
    overrides: [
        // allow `any` broadly in tests, scripts and prisma helpers used in this repo
        {
            files: ['tests/**/*.{ts,tsx}', 'scripts/**/*', 'prisma/**/*', 'app/**/*.{ts,tsx}'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off'
            }
        },
        // allow require() style imports in script/config files
        {
            files: ['scripts/**/*', 'prisma/**/*', 'jest.setup.js', 'prisma/seed.js', 'prisma.cli.config.cjs', 'prisma.config.js'],
            rules: {
                '@typescript-eslint/no-require-imports': 'off'
            }
        }
    ]
}


