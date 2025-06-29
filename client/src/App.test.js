// src/App.test.js

import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

test('renders the Fibonacci calculator title', async () => {
  // Mock API responses
  axios.get
    .mockResolvedValueOnce({ data: {} }) // /api/values/current
    .mockResolvedValueOnce({ data: [] }); // /api/values/all

  render(<App />);
  
  const titleElement = await screen.findByText(/Welcome to the Fibonacci Calculator/i);
  expect(titleElement).toBeInTheDocument();
});