import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login page correctly', () => {
  render(<App />);

  const signInHeading = screen.getByRole('heading', { name: /sign in/i });
  expect(signInHeading).toBeInTheDocument();

  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toBeInTheDocument();

  const passwordInput = screen.getByLabelText(/password/i);
  expect(passwordInput).toBeInTheDocument();

  const signInButton = screen.getByRole('button', { name: /sign in with email and password/i });
  expect(signInButton).toBeInTheDocument();
});
