import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from '@/presentation/components/MessageList';
import type { Message } from '@/core';

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: crypto.randomUUID(),
    roomId: 'general',
    senderName: 'Alex',
    text: 'Hello',
    sentAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('MessageList', () => {
  it('should show an empty state when there are no messages', () => {
    render(<MessageList messages={[]} currentDisplayName="Alex" />);

    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('should render each message text', () => {
    const messages = [
      makeMessage({ text: 'first message' }),
      makeMessage({ text: 'second message', senderName: 'Sam' }),
    ];

    render(<MessageList messages={messages} currentDisplayName="Alex" />);

    expect(screen.getByText('first message')).toBeInTheDocument();
    expect(screen.getByText('second message')).toBeInTheDocument();
  });

  it('should show the sender name for messages from others but not for own messages', () => {
    const messages = [
      makeMessage({ text: 'mine', senderName: 'Alex' }),
      makeMessage({ text: 'theirs', senderName: 'Sam' }),
    ];

    render(<MessageList messages={messages} currentDisplayName="Alex" />);

    expect(screen.queryByText('Alex')).not.toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
  });
});
