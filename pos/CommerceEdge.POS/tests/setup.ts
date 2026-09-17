// Jest setup file - runs before each test suite

// Mock DOM APIs for tests that need them
const mockStorage = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value; },
  removeItem(key: string) { delete this.store[key]; },
  clear() { this.store = {}; },
  get length() { return Object.keys(this.store).length; },
  key(index: number) { return Object.keys(this.store)[index] || null; }
};

(global as any).localStorage = mockStorage;
(global as any).sessionStorage = mockStorage;

const mockWindow = {
  localStorage: mockStorage,
  sessionStorage: mockStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  navigator: { onLine: true },
  Event: class Event { constructor(public type: string) {} },
  CustomEvent: class CustomEvent extends Event { constructor(type: string, public detail?: any) { super(type); } }
};

(global as any).window = mockWindow;
(global as any).navigator = mockWindow.navigator;

(global as any).document = {
  createElement: () => ({}),
  body: { innerHTML: '', appendChild: () => {} },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {}
};

(global as any).HTMLElement = class HTMLElement {};
(global as any).HTMLInputElement = class HTMLInputElement { value = ''; checked = false; type = 'text'; };
(global as any).HTMLDivElement = class HTMLDivElement {};

// Global test setup
beforeAll(() => {
  // Suppress console logs during tests if needed
  // jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  // Cleanup
});