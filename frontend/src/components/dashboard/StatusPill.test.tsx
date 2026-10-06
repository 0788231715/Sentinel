import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('renders the state label with a non-color text indicator', () => {
    render(<StatusPill tone="warning">UNVERIFIED</StatusPill>);
    expect(screen.getByText('UNVERIFIED')).toBeInTheDocument();
  });
});
