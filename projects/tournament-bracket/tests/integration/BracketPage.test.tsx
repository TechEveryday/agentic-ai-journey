import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BracketPage } from '@/presentation/pages/BracketPage';

async function addParticipant(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = screen.getByPlaceholderText('Add a participant...');
  await user.type(input, name);
  await user.click(screen.getByRole('button', { name: 'Add participant' }));
}

describe('BracketPage (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add participants to the pending list', async () => {
    const user = userEvent.setup();
    render(<BracketPage />);

    await waitFor(() => {
      expect(screen.getByText('No participants yet')).toBeInTheDocument();
    });

    await addParticipant(user, 'Alice');
    await addParticipant(user, 'Bob');

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('No participants yet')).not.toBeInTheDocument();
  });

  it('should generate a bracket and render the rounds', async () => {
    const user = userEvent.setup();
    render(<BracketPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a participant...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Tournament name'), 'My Tournament');
    await addParticipant(user, 'Alice');
    await addParticipant(user, 'Bob');
    await addParticipant(user, 'Carol');
    await addParticipant(user, 'Dave');

    const generateButton = screen.getByRole('button', { name: 'Generate Bracket' });
    expect(generateButton).toBeEnabled();
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('My Tournament')).toBeInTheDocument();
    });

    // Semifinal + Final round labels for a 4-player bracket
    expect(screen.getByText('Semifinal')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();

    // All 4 participant names should be visible somewhere in round 1
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });

  it('should advance a winner when a participant is clicked, and eventually crown a champion', async () => {
    const user = userEvent.setup();
    render(<BracketPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a participant...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Tournament name'), 'Championship');
    await addParticipant(user, 'Alice');
    await addParticipant(user, 'Bob');

    await user.click(screen.getByRole('button', { name: 'Generate Bracket' }));

    await waitFor(() => {
      expect(screen.getByText('Championship')).toBeInTheDocument();
    });

    // 2-participant bracket: a single match, clicking a name declares them
    // the winner and should immediately crown them champion.
    const match = screen.getByTestId(/^match-/);
    const aliceButton = within(match).getByText('Alice');
    await user.click(aliceButton);

    await waitFor(() => {
      expect(screen.getByText('Champion: Alice')).toBeInTheDocument();
    });
  });

  it('should return to the participant form when starting a new tournament', async () => {
    const user = userEvent.setup();
    render(<BracketPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a participant...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Tournament name'), 'First');
    await addParticipant(user, 'Alice');
    await addParticipant(user, 'Bob');
    await user.click(screen.getByRole('button', { name: 'Generate Bracket' }));

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'New Tournament' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a participant...')).toBeInTheDocument();
    });
  });

  it('should show a BYE for a 3-participant bracket and auto-advance the top seed', async () => {
    const user = userEvent.setup();
    render(<BracketPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a participant...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Tournament name'), 'Trio Cup');
    await addParticipant(user, 'Alice');
    await addParticipant(user, 'Bob');
    await addParticipant(user, 'Carol');

    await user.click(screen.getByRole('button', { name: 'Generate Bracket' }));

    await waitFor(() => {
      expect(screen.getByText('Trio Cup')).toBeInTheDocument();
    });

    expect(screen.getByText('BYE')).toBeInTheDocument();
    // Top seed (Alice, first participant added) already appears twice: once
    // in her bye match, and once already propagated into the Final.
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(2);
  });
});
