import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { useAuth } from "../context/AuthContext"; 

// --- MOCKING SETUP ---

// 1. Mock the AuthContext module: Mocks the Provider and the useAuth hook.
jest.mock("../context/AuthContext", () => ({
  // Mock the AuthProvider component as a simple pass-through div
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  
  // Mock the useAuth hook
  useAuth: jest.fn(),
}));

// 2. Mock the Page components: Isolates the routing logic from the page contents.
jest.mock("../pages/Signup", () => () => <div data-testid="page-signup">Signup Page Mock</div>);
jest.mock("../pages/Login", () => () => <div data-testid="page-login">Login Page Mock</div>);
jest.mock("../pages/Dashboard", () => () => <div data-testid="page-dashboard">Dashboard Page Mock</div>);
jest.mock("../pages/LandingPage", () => () => <div data-testid="page-landing">Landing Page Mock</div>);

// 3. CRUCIAL FIX: Mock BrowserRouter. This prevents the nested router error 
//    when <App /> (which imports BrowserRouter) is rendered inside <MemoryRouter>.
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    BrowserRouter: ({ children }) => <div>{children}</div>, // Mock BrowserRouter as a simple div
}));


// --- END MOCKING SETUP ---


describe("App Component Routing", () => {
  
  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  // This file contains the corrected, working test cases. The previous failing 
  // boilerplate test ('renders learn react link') has been permanently removed.

  test("renders landing page on default route (User: null)", () => {
    // Mock authentication state: unauthenticated user
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // The mock LandingPage should be visible
    expect(screen.getByTestId("page-landing")).toBeInTheDocument();
  });

  test("renders signup page (User: null)", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("page-signup")).toBeInTheDocument();
  });

  test("renders login page (User: null)", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("page-login")).toBeInTheDocument();
  });

  test("redirects to login if user not authenticated for dashboard", () => {
    // Mock user as null (unauthenticated)
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    // PrivateRoute should trigger <Navigate to="/login">, rendering the Login Mock
    expect(screen.getByTestId("page-login")).toBeInTheDocument();
  });

  test("renders dashboard if user is authenticated", () => {
    // Mock authenticated user
    useAuth.mockReturnValue({ user: { id: '123', name: "Test User" } });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    // PrivateRoute should allow access, rendering the Dashboard Mock
    expect(screen.getByTestId("page-dashboard")).toBeInTheDocument();
  });

  test("unknown route redirects to landing page", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/unknown-route-404"]}>
        <App />
      </MemoryRouter>
    );

    // The catch-all route (path="*") should redirect to "/", rendering the Landing Page Mock
    expect(screen.getByTestId("page-landing")).toBeInTheDocument();
  });
});