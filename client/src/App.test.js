import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Fibonacci calculator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Welcome to the Fibonacci Calculator/i);
  expect(titleElement).toBeInTheDocument();
});