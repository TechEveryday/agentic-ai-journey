import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message, PresenceEvent } from '@/core';
import { validateMessageText } from '@/core';
import type { IMessageTransport } from './IMessageTransport';

export interface UseChatReturn {
  messages: Message[];
  isConnected: boolean;
  error: string | null;
  /** Recent join/leave notifications, most recent last. */
  presenceEvents: PresenceEvent[];
  join: (roomId: string, displayName: string) => Promise<void>;
  send: (text: string) => Promise<void>;
  leave: () => Promise<void>;
}

/**
 * Chat state machine, decoupled from the transport implementation. Depends
 * only on the `IMessageTransport` port so it can run against a real
 * SignalR connection or a mock in tests.
 */
export function useChat(transport: IMessageTransport): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscriptions must be attached exactly once per transport instance and
  // torn down on unmount, independent of join/leave calls.
  const unsubscribesRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    const unsubHistory = transport.onHistory((history) => {
      setMessages(history);
    });
    const unsubMessage = transport.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });
    const unsubPresence = transport.onPresence((event) => {
      setPresenceEvents((prev) => [...prev, event]);
    });

    unsubscribesRef.current = [unsubHistory, unsubMessage, unsubPresence];

    return () => {
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
    };
  }, [transport]);

  const join = useCallback(
    async (roomId: string, displayName: string) => {
      try {
        setError(null);
        await transport.connect(roomId, displayName);
        setIsConnected(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join room';
        setError(message);
        setIsConnected(false);
      }
    },
    [transport]
  );

  const send = useCallback(
    async (text: string) => {
      const validation = validateMessageText(text);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      try {
        setError(null);
        await transport.send(text);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
      }
    },
    [transport]
  );

  const leave = useCallback(async () => {
    try {
      await transport.disconnect();
    } finally {
      setIsConnected(false);
      setMessages([]);
      setPresenceEvents([]);
    }
  }, [transport]);

  return {
    messages,
    isConnected,
    error,
    presenceEvents,
    join,
    send,
    leave,
  };
}
