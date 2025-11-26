import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssignmentForm from "../components/AssignmentForm";
import API from '../api'; // Import the mocked API

// Mock dependencies
jest.mock('../api');
// Mock useAuth is needed as the component might rely on user data for API calls
jest.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'test-user' } }),
}));

describe("AssignmentForm", () => {
  const mockOnSaved = jest.fn();
  
  // A standard item used for testing the editing state
  const mockEditItem = {
      _id: 'a1',
      title: 'Existing Task',
      description: 'Old details',
      dueDate: '2025-10-20T00:00:00.000Z', // ISO format date
      priority: 'High'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock API responses
    API.post.mockResolvedValue({ data: { message: "Added" } });
    API.put.mockResolvedValue({ data: { message: "Updated" } });
  });

  const renderComponent = (props = {}) =>
    render(<AssignmentForm onSaved={mockOnSaved} editItem={null} {...props} />);

  // Helper function to find the specific date input element
  const getDateInput = () => {
      // Find all elements with an empty display value
      const emptyInputs = screen.queryAllByDisplayValue('');
      
      // Filter the results to find the one with type="date"
      const dateInput = emptyInputs.find(input => 
          input.tagName === 'INPUT' && input.getAttribute('type') === 'date'
      );
      
      if (!dateInput) {
          throw new Error("Could not find the date input field.");
      }
      return dateInput;
  };


  test("renders 'Add' form inputs correctly", () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    
    // FIX: Use helper function to accurately locate the date input
    const dateInput = getDateInput();
    expect(dateInput).toHaveAttribute('type', 'date');
    
    // Check form elements and button state for 'Add' mode
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add assignment/i })).toBeInTheDocument();
  });

  test("initializes form with data and renders 'Update' button when editing", () => {
    renderComponent({ editItem: mockEditItem });

    // Check if the form is populated correctly
    expect(screen.getByPlaceholderText(/title/i)).toHaveValue(mockEditItem.title);
    expect(screen.getByPlaceholderText(/description/i)).toHaveValue(mockEditItem.description);
    
    // Check that the date input is formatted correctly (YYYY-MM-DD)
    const dateInput = screen.getByDisplayValue('2025-10-20'); 
    expect(dateInput).toHaveAttribute('type', 'date');
    
    // Check button state for 'Update' mode
    expect(screen.getByRole("button", { name: /update assignment/i })).toBeInTheDocument();
  });


  test("submits new assignment via API.post and calls onSaved", async () => {
    renderComponent();
    
    const dateInput = getDateInput(); // Use helper function

    // Fill all required inputs
    fireEvent.change(screen.getByPlaceholderText(/title/i), {
      target: { value: "New Homework" },
    });
    // Find date input by type and value attribute
    fireEvent.change(dateInput, { 
      target: { value: "2024-11-25" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "High" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /add assignment/i }));

    // FIX: Wait for API call and state update to complete
    await waitFor(() => {
      // Check if API.post was called with the correct formatted dueDate object
      expect(API.post).toHaveBeenCalledTimes(1);
      expect(API.post).toHaveBeenCalledWith('/assignments', expect.objectContaining({
        title: 'New Homework',
        priority: 'High',
        dueDate: expect.any(Date), // Checks if dueDate was correctly converted to Date object
      }));
      // Check if the success callback ran
      expect(mockOnSaved).toHaveBeenCalledTimes(1);
    });
  });

  test("submits update via API.put and calls onSaved when editing", async () => {
    renderComponent({ editItem: mockEditItem });

    // Change the description
    fireEvent.change(screen.getByPlaceholderText(/description/i), {
      target: { value: "Updated details" },
    });

    // Submit the form (Button text is 'Update Assignment')
    fireEvent.submit(screen.getByRole("button", { name: /update assignment/i }));

    await waitFor(() => {
      // Check if API.put was called with the correct endpoint and data
      expect(API.put).toHaveBeenCalledTimes(1);
      expect(API.put).toHaveBeenCalledWith(`/assignments/${mockEditItem._id}`, expect.objectContaining({
        description: 'Updated details',
        // Original fields should be preserved in the submission payload
        title: mockEditItem.title,
        priority: mockEditItem.priority,
        dueDate: expect.any(Date),
      }));
      // Check if the success callback ran
      expect(mockOnSaved).toHaveBeenCalledTimes(1);
    });
  });
});