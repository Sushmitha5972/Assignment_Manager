import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../pages/Signup";
import API from '../api';

// --- MOCKING SETUP: GUARANTEED MODULE REPLACEMENT ---

// 1. Mock the necessary hooks from 'react-router-dom' globally for this file.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  // Keep required exports like MemoryRouter
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate, // Mock useNavigate
  Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link
}));

// 2. Mock useAuth module to guarantee the component finds the 'login' function.
// This is the definitive fix for the "Cannot destructure property 'login' of ... as it is undefined." error.
const mockLogin = jest.fn(() => Promise.resolve()); 
jest.mock("../context/AuthContext", () => ({
    // The factory function returns the exact object the component tries to destructure.
    useAuth: () => ({
        login: mockLogin,
        user: null, 
    }),
}));

// 3. Mock API
jest.mock('../api'); 

// --- END MOCKING SETUP ---

describe("Signup Component", () => {
  
  beforeEach(() => {
    // Clear mocks before each test
    mockLogin.mockClear();
    mockNavigate.mockClear();
    API.post.mockClear();
  });
    
  // Helper to render the component wrapped in MemoryRouter
  const renderComponent = () => render(
    <MemoryRouter>
        <Signup />
    </MemoryRouter>
  );

  test("renders all input fields and button", () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    
    // NOTE: Button text in your component is "Sign up"
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("updates input values when typed", () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText(/name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(nameInput).toHaveValue("Test User");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("123456");
  });

  test("calls API and login on successful submit", async () => {
    const mockToken = "new-user-token";
    const mockUser = { id: 2, name: "Test User" };
    const formData = { name: "Test User", email: "test@example.com", password: "123" };
    
    API.post.mockResolvedValueOnce({ 
        data: { token: mockToken, user: mockUser } 
    });
    
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: formData.name } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: formData.email } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: formData.password } });
    
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
        expect(API.post).toHaveBeenCalledWith('/auth/signup', formData);
        expect(mockLogin).toHaveBeenCalledWith(mockToken, mockUser);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard'); 
    });
  });

  test("displays error message on failed signup", async () => {
    const errorMessage = 'User already exists.';
    
    API.post.mockRejectedValueOnce({ 
        response: { data: { message: errorMessage } } 
    });
    
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});