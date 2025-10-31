// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders health tracker app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Health Tracker/i);
  expect(linkElement).toBeInTheDocument();
});