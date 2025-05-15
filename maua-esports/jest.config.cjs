export const testEnvironment = 'node';
export const setupFilesAfterEnv = ['./tests/setup.cjs'];
export const testPathIgnorePatterns = [
    '/node_modules/',
    '/client/'
];
export const testMatch = [
    '**/tests/**/*.test.cjs',
    '**/tests/**/*.spec.cjs'
];
export const verbose = true;