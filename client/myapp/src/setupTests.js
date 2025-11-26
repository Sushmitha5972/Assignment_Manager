import "@testing-library/jest-dom";

const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),

  // create() returns the same mock
  create: jest.fn(() => mockAxios),

  // mock interceptors
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

jest.mock("axios", () => mockAxios);
