import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/badge';

describe('StatusBadge component', () => {
  it('renders Active badge with correct text', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Inactive badge with correct text', () => {
    render(<StatusBadge status="INACTIVE" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders Terminated badge with correct text', () => {
    render(<StatusBadge status="TERMINATED" />);
    expect(screen.getByText('Terminated')).toBeInTheDocument();
  });
});
