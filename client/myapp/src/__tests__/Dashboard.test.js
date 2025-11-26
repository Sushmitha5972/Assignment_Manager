// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import Dashboard from "../pages/Dashboard";
// import { useAuth } from "../context/AuthContext";
// import API from '../api';
// import { MemoryRouter } from "react-router-dom"; // Needed for the nested Logout button/Link

// // --- MOCKING DEPENDENCIES ---

// // Mock API (Dashboard calls API.get/post/put/delete)
// jest.mock('../api'); 

// // Mock useAuth (Dashboard uses { user } = useAuth())
// const mockUser = { id: 'test-user-id', name: 'Test User' };
// const mockLogout = jest.fn();
// jest.mock("../context/AuthContext", () => ({
//     useAuth: jest.fn(),
// }));

// // Mock useNavigate if Dashboard uses any navigation (like the Logout button)
// const mockNavigate = jest.fn();
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useNavigate: () => mockNavigate,
// }));

// // --- END MOCKING DEPENDENCIES ---

// describe("Dashboard Component", () => {
  
//   const mockAssignments = [
//     { _id: '1', title: 'Math Homework', priority: 'High', status: 'Pending' },
//   ];

//   beforeEach(() => {
//     // Set authenticated state and mock API response for initial fetch
//     useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    
//     // CRITICAL FIX: Ensure API.get returns data for initial fetch in Dashboard.js useEffect
//     API.get.mockResolvedValue({ data: mockAssignments });
    
//     // Clear mocks for isolation
//     jest.clearAllMocks();
//     API.get.mockResolvedValue({ data: mockAssignments }); // Re-mock for reliability
    
//   });

//   const renderComponent = () => render(
//     // Wrap Dashboard in MemoryRouter to support the Logout button (if it uses Link or useNavigate)
//     <MemoryRouter> 
//       <Dashboard />
//     </MemoryRouter>
//   );

//   test("renders assignment form, controls, and list area", async () => {
//     renderComponent();
    
//     // Wait for the asynchronous API fetch inside Dashboard to resolve
//     await waitFor(() => {
//         // Assert top bar/user info
//         expect(screen.getByText(/Assignment Deadline Manager/i)).toBeInTheDocument();
//         expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
        
//         // Assert input fields for adding an assignment
//         expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
//         expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
        
//         // CRITICAL FIX for "Found multiple elements with the role 'combobox'"
//         // Find the 'Priority' combobox using its visible text label or implied label
//         expect(screen.getByRole("combobox", { name: /priority/i })).toBeInTheDocument(); 
        
//         // Find the 'Sort' combobox
//         expect(screen.getByRole("combobox", { name: /sort/i })).toBeInTheDocument();
        
//         // Find the 'Filter' combobox
//         expect(screen.getByRole("combobox", { name: /filter/i })).toBeInTheDocument();

//         expect(screen.getByRole("button", { name: /add assignment/i })).toBeInTheDocument();
        
//         // Assert one assignment is rendered from mock data
//         expect(screen.getByText('Math Homework')).toBeInTheDocument();
//     });
//   });
  
//   // Add more tests here for adding, editing, and deleting assignments...
// });

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import { useAuth } from "../context/AuthContext";
import API from '../api';
import { MemoryRouter } from "react-router-dom"; 

// --- MOCKING DEPENDENCIES ---

// Mock API (REQUIRED FIX: Ensures API calls resolve data correctly)
jest.mock('../api'); 

// Mock useAuth (Dashboard uses { user } = useAuth())
const mockUser = { id: 'test-user-id', name: 'Test User' };
const mockLogout = jest.fn();
const mockUseAuth = jest.fn(); 

jest.mock("../context/AuthContext", () => ({
    // Expose the mock function so we can set the return value in beforeEach
    useAuth: () => mockUseAuth(),
}));

// Mock useNavigate (Needed for routing contexts, usually defined globally)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock external sub-components (CRITICAL FIX for isolated unit testing)
jest.mock('../components/AssignmentForm', () => ({ onSaved, editItem }) => (
    <div data-testid="assignment-form-mock">Form Mock</div>
));
jest.mock('../components/AssignmentList', () => ({ assignments, onEdit, onRefresh }) => (
    <div data-testid="assignment-list-mock">
        {assignments.length === 0 ? "No assignments" : assignments.map(a => <div key={a._id}>{a.title}</div>)}
    </div>
));
jest.mock('../components/Chatbot', () => () => <div data-testid="chatbot-mock">Chatbot Mock</div>);


// --- END MOCKING DEPENDENCIES ---

describe("Dashboard Component", () => {
  
  const mockAssignments = [
    { _id: '1', title: 'Math Homework', priority: 'High', status: 'Pending', dueDate: '2025-12-31' },
  ];

  beforeEach(() => {
    // 1. Setup Auth and provide user/logout object
    mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    
    // 2. Mock API success response for the initial data fetch 
    API.get.mockResolvedValue({ data: mockAssignments });
    
    // Clear call counts
    jest.clearAllMocks();
    
    // Re-set mock return values after clearing counts
    mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout }); 
    API.get.mockResolvedValue({ data: mockAssignments });
  });

  const renderComponent = () => render(
    <MemoryRouter> 
      <Dashboard />
    </MemoryRouter>
  );

  test("renders top bar, form, list, and controls correctly", async () => {
    renderComponent();
    
    // Wait for the asynchronous data fetch (useEffect)
    await waitFor(() => {
        // Assert Topbar/User info
        expect(screen.getByText(/Assignment Deadline Manager/i)).toBeInTheDocument();
        expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

        // Assert mocked components
        expect(screen.getByTestId("assignment-form-mock")).toBeInTheDocument();
        expect(screen.getByTestId("chatbot-mock")).toBeInTheDocument();
        
        // CRITICAL FIX: Use the explicit labels for the selects (comboboxes) that are directly rendered in Dashboard.js
        // The Priority select disappeared because AssignmentForm is mocked.
        expect(screen.getByRole("combobox", { name: /Sort:/i })).toBeInTheDocument(); 
        expect(screen.getByRole("combobox", { name: /Filter:/i })).toBeInTheDocument();

        // Assert fetched data is rendered via the mocked AssignmentList
        expect(screen.getByText('Math Homework')).toBeInTheDocument();
    });
  });
  
  test("calls logout function when button is clicked", async () => {
    renderComponent();
    
    await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /logout/i }));
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});