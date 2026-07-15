import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinDialog } from '@/presentation/components/JoinDialog';

describe('JoinDialog', () => {
  it('should not render dialog content when closed', () => {
    render(<JoinDialog open={false} onJoin={vi.fn()} />);

    expect(screen.queryByText('Join a chat room')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<JoinDialog open onJoin={vi.fn()} />);

    expect(screen.getByText('Join a chat room')).toBeInTheDocument();
  });

  it('should disable the join button until a display name is entered', async () => {
    const user = userEvent.setup();
    render(<JoinDialog open onJoin={vi.fn()} />);

    const joinButton = screen.getByRole('button', { name: /join/i });
    expect(joinButton).toBeDisabled();

    await user.type(screen.getByLabelText('Display name'), 'Alex');

    expect(joinButton).toBeEnabled();
  });

  it('should call onJoin with trimmed room id and display name', async () => {
    const user = userEvent.setup();
    const onJoin = vi.fn();
    render(<JoinDialog open onJoin={onJoin} />);

    const roomInput = screen.getByLabelText('Room');
    await user.clear(roomInput);
    await user.type(roomInput, '  lobby  ');
    await user.type(screen.getByLabelText('Display name'), '  Alex  ');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(onJoin).toHaveBeenCalledWith('lobby', 'Alex');
  });
});
