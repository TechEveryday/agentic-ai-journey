import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChat } from '@/application';
import type { Message } from '@/core';
import { MockMessageTransport } from './MockMessageTransport';

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

describe('useChat', () => {
  let transport: MockMessageTransport;

  beforeEach(() => {
    transport = new MockMessageTransport();
  });

  it('should start disconnected with no messages', () => {
    const { result } = renderHook(() => useChat(transport));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should connect on join and mark isConnected true', async () => {
    const { result } = renderHook(() => useChat(transport));

    await act(async () => {
      await result.current.join('general', 'Alex');
    });

    expect(result.current.isConnected).toBe(true);
    expect(transport.connectCalls).toEqual([{ roomId: 'general', displayName: 'Alex' }]);
  });

  it('should surface an error and stay disconnected when connect fails', async () => {
    transport.connectShouldFail = true;
    const { result } = renderHook(() => useChat(transport));

    await act(async () => {
      await result.current.join('general', 'Alex');
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should replace messages when history is received', async () => {
    const { result } = renderHook(() => useChat(transport));
    const history = [makeMessage({ text: 'first' }), makeMessage({ text: 'second' })];

    act(() => {
      transport.emitHistory(history);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });
    expect(result.current.messages).toEqual(history);
  });

  it('should append incoming messages', async () => {
    const { result } = renderHook(() => useChat(transport));
    const incoming = makeMessage({ text: 'new message' });

    act(() => {
      transport.emitMessage(incoming);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });
    expect(result.current.messages[0]).toEqual(incoming);
  });

  it('should collect presence events', async () => {
    const { result } = renderHook(() => useChat(transport));

    act(() => {
      transport.emitPresence({ type: 'joined', displayName: 'Sam' });
    });

    await waitFor(() => {
      expect(result.current.presenceEvents).toHaveLength(1);
    });
    expect(result.current.presenceEvents[0]).toEqual({ type: 'joined', displayName: 'Sam' });
  });

  it('should send valid text via the transport', async () => {
    const { result } = renderHook(() => useChat(transport));

    await act(async () => {
      await result.current.send('Hello world');
    });

    expect(transport.sentTexts).toEqual(['Hello world']);
    expect(result.current.error).toBeNull();
  });

  it('should reject empty text without calling the transport', async () => {
    const { result } = renderHook(() => useChat(transport));

    await act(async () => {
      await result.current.send('   ');
    });

    expect(transport.sentTexts).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it('should surface an error when send fails', async () => {
    transport.sendShouldFail = true;
    const { result } = renderHook(() => useChat(transport));

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should disconnect and clear state on leave', async () => {
    const { result } = renderHook(() => useChat(transport));

    await act(async () => {
      await result.current.join('general', 'Alex');
    });
    act(() => {
      transport.emitMessage(makeMessage());
    });
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    await act(async () => {
      await result.current.leave();
    });

    expect(transport.disconnectCallCount).toBe(1);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages).toEqual([]);
  });
});
