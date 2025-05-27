import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CyberThreat Atlas app', () => {
  render(<App />);
  const linkElement = screen.getByText(/CyberThreat Atlas/i);
  expect(linkElement).toBeInTheDocument();
});
