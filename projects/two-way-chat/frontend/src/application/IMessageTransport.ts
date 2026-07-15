import type { Message, PresenceEvent } from '@/core';

/**
 * Port for the chat transport. `useChat` depends only on this interface —
 * never on `@microsoft/signalr` directly — so the hook can be tested with a
 * mock and the real transport can be swapped without touching application
 * logic.
 */
export interface IMessageTransport {
  connect(roomId: string, displayName: string): Promise<void>;
  disconnect(): Promise<void>;
  send(text: string): Promise<void>;
  /** Returns an unsubscribe function. */
  onMessage(cb: (m: Message) => void): () => void;
  /** Returns an unsubscribe function. */
  onPresence(cb: (e: PresenceEvent) => void): () => void;
  /** Returns an unsubscribe function. */
  onHistory(cb: (ms: Message[]) => void): () => void;
}
