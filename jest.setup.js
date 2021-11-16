import '@testing-library/jest-dom/extend-expect';
import { server } from './resources/js/__mocks__/server.js';

require('whatwg-fetch');

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }

    disconnect() {
        return null;
    }

    observe() {
        return null;
    }

    takeRecords() {
        return null;
    }

    unobserve() {
        return null;
    }
};

beforeAll(() => {
    server.listen()
});
beforeEach(() => {
    jest.useFakeTimers()
});
afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    server.resetHandlers()
});
afterAll(() => {
    server.close()
});