import { render, screen } from '@testing-library/react';
import { AgentCard } from '@/components/AgentCard';
import type { Agent } from '@/lib/types';

const mockAgent: Agent = {
  id: 'agent-1',
  worldId: 'world-1',
  name: 'Maya',
  role: 'Former engineer',
  personality: 'Strategic and skeptical',
  goal: 'Build a stable society',
  fears: ['chaos'],
  values: ['order'],
  status: 'active',
  energy: 85,
  trustScore: 62,
  publicReputation: 70,
  createdAt: '2026-06-28T00:00:00Z',
  updatedAt: '2026-06-28T00:00:00Z',
};

describe('AgentCard', () => {
  it('renders agent name', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Maya')).toBeInTheDocument();
  });

  it('renders agent role', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Former engineer')).toBeInTheDocument();
  });

  it('renders trust score', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('62')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders exiled status with correct styling', () => {
    render(<AgentCard agent={{ ...mockAgent, status: 'exiled' }} />);
    const badge = screen.getByText('exiled');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-red-400');
  });
});
