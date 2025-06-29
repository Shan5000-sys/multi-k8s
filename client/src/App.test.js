import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Fibonacci Calculator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Fibonacci Calculator/i);
  expect(titleElement).toBeInTheDocument();
});