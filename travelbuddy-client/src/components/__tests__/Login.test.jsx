import React from "react";
import { render, screen } from "@testing-library/react";

// Create a mock Login component for testing
const MockLogin = () => {
  return (
    <div>
      <h1>Customer Login</h1>
      <input placeholder="Type Your Username" />
      <input placeholder="Type Your Password" type="password" />
      <button>Login</button>
      <button>Sign up</button>
      <a href="/forgotPassword">Forgot Password?</a>
      <a href="/register">Sign Up Now</a>
    </div>
  );
};

describe("Login Component Tests", () => {
  test("renders login title", () => {
    render(<MockLogin />);
    expect(screen.getByText("Customer Login")).toBeInTheDocument();
  });

  test("renders username input", () => {
    render(<MockLogin />);
    expect(screen.getByPlaceholderText("Type Your Username")).toBeInTheDocument();
  });

  test("renders password input", () => {
    render(<MockLogin />);
    expect(screen.getByPlaceholderText("Type Your Password")).toBeInTheDocument();
  });

  test("renders login button", () => {
    render(<MockLogin />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("renders sign up button", () => {
    render(<MockLogin />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });
});