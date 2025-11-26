import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";

// --- MOCKING SETUP: GUARANTEED APPROACH ---

// 1. Define the reusable mock functions
const mockLogin = jest.fn(() => Promise.resolve());
const mockNavigate = jest.fn();

// 2. Mock the AuthContext module completely. This prevents the TypeError.
// The path MUST match the path used in Login.js: '../context/AuthContext'
jest.mock('../context/AuthContext', () => ({
    // This factory function defines what the module exports.
    useAuth: () => ({ 
        login: mockLogin, // Provide the required 'login' function
        // If Login.js uses 'user', 'logout', etc., add them here:
        // user: null,
        // logout: jest.fn(),
    }),
}));

// 3. Mock the react-router-dom dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Keep original exports like MemoryRouter
  useNavigate: () => mockNavigate, // Mock useNavigate
  Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link component
}));

// 4. Mock the API dependency
import API from '../api';
jest.mock('../api'); 

// --- END MOCKING SETUP ---

describe("Login Component", () => {
  // Clear mock history and call counts before each test
  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
    API.post.mockClear();
  });
    
  test("renders email and password inputs and the Login button", () => {
    // This render should now succeed due to the mocks
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("updates input values when typed", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("123456");
  });

  test("calls login and navigates to /dashboard on successful submit", async () => {
    // Setup API mock response for success
    const mockToken = "fake-token-123";
    const mockUser = { id: 1, email: "test@example.com" };
    
    API.post.mockResolvedValueOnce({ 
        data: { token: mockToken, user: mockUser } 
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const email = "test@example.com";
    const password = "123456";
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: password } });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for the async actions (API call and state updates)
    await waitFor(() => {
        // 1. Verify API was called
        expect(API.post).toHaveBeenCalledWith('/auth/login', { email, password });

        // 2. Verify Auth Context's login function was called
        expect(mockLogin).toHaveBeenCalledWith(mockToken, mockUser);
        
        // 3. Verify successful navigation
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard'); 
    });
  });
  
  test("displays error message on failed login", async () => {
    const errorMessage = 'Invalid credentials.';
    
    // Setup API mock response for failure
    API.post.mockRejectedValueOnce({ 
        response: { data: { message: errorMessage } } 
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bad@user.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
        // Verify the login context function was NOT called
        expect(mockLogin).not.toHaveBeenCalled();

        // Verify the error message is displayed
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        
        // Verify navigation did not occur
        expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});