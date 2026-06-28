import { render, screen } from '@testing-library/react';
import { EpisodeCard } from '@/components/EpisodeCard';
import type { Episode } from '@/lib/types';

const mockEpisode: Episode = {
  id: 'ep-1',
  worldId: 'world-1',
  seasonId: 'season-1',
  number: 3,
  title: 'The Food Scandal',
  previouslySummary: 'Things were tense.',
  summary: 'Leo was caught hiding food. Maya called him out publicly.',
  mainEvents: [{ order: 1, description: 'Leo hid food', involvedAgents: ['Leo'] }],
  cliffhanger: 'Maya is planning a confrontation at sunset.',
  status: 'published',
  publishedAt: '2026-06-28T10:00:00Z',
  createdAt: '2026-06-28T09:00:00Z',
};

describe('EpisodeCard', () => {
  it('renders the episode number', () => {
    render(<EpisodeCard episode={mockEpisode} />);
    expect(screen.getByText('Episode 3')).toBeInTheDocument();
  });

  it('renders the episode title', () => {
    render(<EpisodeCard episode={mockEpisode} />);
    expect(screen.getByText('The Food Scandal')).toBeInTheDocument();
  });

  it('renders the episode summary', () => {
    render(<EpisodeCard episode={mockEpisode} />);
    expect(screen.getByText(/Leo was caught hiding food/)).toBeInTheDocument();
  });

  it('renders the cliffhanger', () => {
    render(<EpisodeCard episode={mockEpisode} />);
    expect(screen.getByText(/Maya is planning a confrontation/)).toBeInTheDocument();
  });

  it('does not crash when publishedAt is null', () => {
    render(<EpisodeCard episode={{ ...mockEpisode, publishedAt: null }} />);
    expect(screen.getByText('The Food Scandal')).toBeInTheDocument();
  });
});
