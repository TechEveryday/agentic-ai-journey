import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageComposer } from '@/presentation/components/MessageComposer';

describe('MessageComposer', () => {
  it('should call onSend with the typed text and clear the input', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello world');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(onSend).toHaveBeenCalledWith('Hello world');
    expect(input).toHaveValue('');
  });

  it('should not call onSend for empty input', () => {
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);

    // The send button is disabled for empty input by design (see below),
    // so submit the form directly to confirm the handler's own guard also
    // rejects empty/whitespace text.
    const form = screen.getByPlaceholderText('Type a message...').closest('form')!;
    fireEvent.submit(form);

    expect(onSend).not.toHaveBeenCalled();
  });

  it('should disable the send button for empty input', () => {
    render(<MessageComposer onSend={vi.fn()} />);

    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('should disable input and button when disabled prop is true', () => {
    render(<MessageComposer onSend={vi.fn()} disabled />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('should submit on Enter within the form', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hi there{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hi there');
  });
});
