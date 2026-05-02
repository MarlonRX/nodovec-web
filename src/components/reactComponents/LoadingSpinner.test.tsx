import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders an SVG element', () => {
    render(<LoadingSpinner />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has animate-spin class', () => {
    render(<LoadingSpinner />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });
});
