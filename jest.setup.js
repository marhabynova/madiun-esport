/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: './.env' })
// Ensure Prisma uses a local library engine during tests to avoid
// the 'client' engine requiring an external adapter/accelerateUrl.
process.env.PRISMA_CLIENT_ENGINE = process.env.PRISMA_CLIENT_ENGINE || 'library'
// jest-dom adds custom jest matchers for asserting on DOM nodes.
try {
    require('@testing-library/jest-dom')
} catch {
    // not installed in minimal environments
}
