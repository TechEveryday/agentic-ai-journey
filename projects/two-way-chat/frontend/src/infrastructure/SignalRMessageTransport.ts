import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import type { Message, PresenceEvent } from '@/core';
import type { IMessageTransport } from '@/application';

const DEFAULT_HUB_URL = 'http://localhost:5000/hubs/chat';

function getHubUrl(): string {
  return import.meta.env.VITE_HUB_URL ?? DEFAULT_HUB_URL;
}

type Unsubscribe = () => void;

/**
 * Real transport backed by SignalR. Not meaningfully unit-testable (it
 * requires a live hub connection); covered by the Playwright e2e test
 * instead, and excluded from Vitest coverage thresholds (see
 * vite.config.ts).
 */
export class SignalRMessageTransport implements IMessageTransport {
  private connection: HubConnection | null = null;
  private roomId: string | null = null;

  private readonly messageListeners = new Set<(m: Message) => void>();
  private readonly presenceListeners = new Set<(e: PresenceEvent) => void>();
  private readonly historyListeners = new Set<(ms: Message[]) => void>();

  async connect(roomId: string, displayName: string): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      await this.disconnect();
    }

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (message: Message) => {
      this.messageListeners.forEach((cb) => cb(message));
    });

    connection.on('MessageHistory', (history: Message[]) => {
      this.historyListeners.forEach((cb) => cb(history));
    });

    connection.on('UserJoined', (name: string) => {
      this.presenceListeners.forEach((cb) => cb({ type: 'joined', displayName: name }));
    });

    connection.on('UserLeft', (name: string) => {
      this.presenceListeners.forEach((cb) => cb({ type: 'left', displayName: name }));
    });

    await connection.start();
    await connection.invoke('JoinRoom', roomId, displayName);

    this.connection = connection;
    this.roomId = roomId;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.roomId = null;
    }
  }

  async send(text: string): Promise<void> {
    if (!this.connection || !this.roomId) {
      throw new Error('Cannot send a message before joining a room');
    }

    await this.connection.invoke('SendMessage', this.roomId, text);
  }

  onMessage(cb: (m: Message) => void): Unsubscribe {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  onPresence(cb: (e: PresenceEvent) => void): Unsubscribe {
    this.presenceListeners.add(cb);
    return () => this.presenceListeners.delete(cb);
  }

  onHistory(cb: (ms: Message[]) => void): Unsubscribe {
    this.historyListeners.add(cb);
    return () => this.historyListeners.delete(cb);
  }
}
