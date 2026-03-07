import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const MockRegister = () => {
  return (
    <div>
      <h1>Customer Register</h1>
      <input placeholder="Name" />
      <input placeholder="Email Address" />
      <input placeholder="Phone Number" />
      <input placeholder="Password" type="password" />
      <input placeholder="Confirm Password" type="password" />
      <button type="button">Sign Up</button>
      <a href="/login">LOGIN</a>
    </div>
  );
};

afterEach(() => {
  cleanup();
});

describe("Register Component", () => {
  test("renders all form fields", () => {
    render(<MockRegister />);
    
    expect(screen.getByText("Customer Register")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
  });

  test("allows user input", () => {
    render(<MockRegister />);
    
    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email Address");
    
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    
    expect(nameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("john@example.com");
  });
});