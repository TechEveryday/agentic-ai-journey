import type { Message, PresenceEvent } from '@/core';
import type { IMessageTransport } from '@/application';

/**
 * In-memory transport double for testing `useChat` without a real SignalR
 * connection. Exposes `emitMessage`/`emitHistory`/`emitPresence` helpers so
 * tests can simulate server pushes, and records calls for assertions.
 */
export class MockMessageTransport implements IMessageTransport {
  connectCalls: Array<{ roomId: string; displayName: string }> = [];
  sentTexts: string[] = [];
  disconnectCallCount = 0;

  connectShouldFail = false;
  sendShouldFail = false;

  private messageListeners = new Set<(m: Message) => void>();
  private presenceListeners = new Set<(e: PresenceEvent) => void>();
  private historyListeners = new Set<(ms: Message[]) => void>();

  async connect(roomId: string, displayName: string): Promise<void> {
    if (this.connectShouldFail) {
      throw new Error('Failed to connect');
    }
    this.connectCalls.push({ roomId, displayName });
  }

  async disconnect(): Promise<void> {
    this.disconnectCallCount += 1;
  }

  async send(text: string): Promise<void> {
    if (this.sendShouldFail) {
      throw new Error('Failed to send message');
    }
    this.sentTexts.push(text);
  }

  onMessage(cb: (m: Message) => void): () => void {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  onPresence(cb: (e: PresenceEvent) => void): () => void {
    this.presenceListeners.add(cb);
    return () => this.presenceListeners.delete(cb);
  }

  onHistory(cb: (ms: Message[]) => void): () => void {
    this.historyListeners.add(cb);
    return () => this.historyListeners.delete(cb);
  }

  // --- Test helpers to simulate server pushes ---

  emitMessage(message: Message): void {
    this.messageListeners.forEach((cb) => cb(message));
  }

  emitHistory(messages: Message[]): void {
    this.historyListeners.forEach((cb) => cb(messages));
  }

  emitPresence(event: PresenceEvent): void {
    this.presenceListeners.forEach((cb) => cb(event));
  }
}
