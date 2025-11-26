import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chatbot from "../components/Chatbot";

describe("Chatbot component", () => {
  test("can ask a question and receive rule-based answer", async () => {
    render(<Chatbot />);

    const input = screen.getByPlaceholderText(/ask your question/i);
    const askButton = screen.getByText(/ask/i);

    fireEvent.change(input, { target: { value: "Hi bot" } });
    fireEvent.click(askButton);

    await waitFor(() => {
      expect(screen.getByText(/hi bot/i)).toBeInTheDocument();
      expect(
        screen.getByText(/hello! how can i help you today\?/i)
      ).toBeInTheDocument();
    });
  });
});
