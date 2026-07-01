import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoteWidget } from '@/components/VoteWidget';
import type { Vote } from '@/lib/types';

const mockVote: Vote = {
  id: 'vote-1',
  worldId: 'world-1',
  episodeId: 'ep-1',
  optionA: 'Heavy storm',
  optionB: 'Food shortage',
  optionC: 'Discovery of a hidden cave',
  optionD: 'A mysterious message appears',
  votesA: 3,
  votesB: 1,
  votesC: 0,
  votesD: 0,
  winnerId: null,
  closesAt: '2099-01-01T00:00:00Z',
  createdAt: '2026-06-28T00:00:00Z',
};

describe('VoteWidget', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('renders all four options', () => {
    render(<VoteWidget vote={mockVote} />);
    expect(screen.getByText('Heavy storm')).toBeInTheDocument();
    expect(screen.getByText('Food shortage')).toBeInTheDocument();
    expect(screen.getByText('Discovery of a hidden cave')).toBeInTheDocument();
    expect(screen.getByText('A mysterious message appears')).toBeInTheDocument();
  });

  it('casts a vote and shows confirmation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, vote: { ...mockVote, votesA: 4 } }),
    });

    render(<VoteWidget vote={mockVote} />);
    fireEvent.click(screen.getByText('Heavy storm'));

    await waitFor(() => {
      expect(screen.getByText(/Vote cast!/)).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/votes/vote-1/cast'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows an error when the vote fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Vote is closed' }),
    });

    render(<VoteWidget vote={mockVote} />);
    fireEvent.click(screen.getByText('Heavy storm'));

    await waitFor(() => {
      expect(screen.getByText('Vote is closed')).toBeInTheDocument();
    });
  });

  it('disables further voting after casting', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, vote: { ...mockVote, votesA: 4 } }),
    });

    render(<VoteWidget vote={mockVote} />);
    fireEvent.click(screen.getByText('Heavy storm'));
    await waitFor(() => screen.getByText(/Vote cast!/));

    fireEvent.click(screen.getByText('Food shortage'));
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
