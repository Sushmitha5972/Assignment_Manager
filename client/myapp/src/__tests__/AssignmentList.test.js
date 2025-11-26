import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AssignmentList from "../components/AssignmentList";
import API from "../api";

jest.mock("../api");

describe("AssignmentList", () => {
  const assignments = [
    {
      _id: "1",
      title: "Math Homework",
      description: "Chapter 5 exercises",
      dueDate: "2025-11-30",
      priority: "High",
      status: "Pending",
    },
    {
      _id: "2",
      title: "Science Project",
      description: "Build a volcano",
      dueDate: "2025-12-05",
      priority: "Medium",
      status: "Completed",
    },
  ];

  const onRefreshMock = jest.fn();

  beforeEach(() => {
    onRefreshMock.mockClear();
  });

  test("renders assignments correctly", () => {
    render(<AssignmentList assignments={assignments} onRefresh={onRefreshMock} />);

    expect(screen.getByText("Math Homework")).toBeInTheDocument();
    expect(screen.getByText("Chapter 5 exercises")).toBeInTheDocument();

    // Use getAllByText because multiple "Due:" exists
    expect(screen.getAllByText(/Due:/i).length).toBe(2);
    expect(screen.getAllByText(/Priority:/i).length).toBe(2);
    expect(screen.getByText("Science Project")).toBeInTheDocument();
  });

  test("marks assignment as completed", () => {
    API.put.mockResolvedValueOnce({});

    render(<AssignmentList assignments={assignments} onRefresh={onRefreshMock} />);

    const markBtn = screen.getByText("Mark Completed");
    fireEvent.click(markBtn);

    expect(API.put).toHaveBeenCalledWith(`/assignments/1`, { status: "Completed" });
    // onRefreshMock may need async wait if used in real component
  });

  test("deletes assignment when confirmed", () => {
    API.delete.mockResolvedValueOnce({});
    window.confirm = jest.fn(() => true); // simulate confirm dialog

    render(<AssignmentList assignments={assignments} onRefresh={onRefreshMock} />);

    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(API.delete).toHaveBeenCalledWith(`/assignments/1`);
  });

  test("does not delete assignment when canceled", () => {
    window.confirm = jest.fn(() => false);

    render(<AssignmentList assignments={assignments} onRefresh={onRefreshMock} />);

    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(API.delete).not.toHaveBeenCalled();
  });
});
