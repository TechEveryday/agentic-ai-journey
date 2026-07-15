/**
 * Mirrors the server's `Message` record (Chat.Domain/Message.cs). Field
 * order and names line up with the JSON SignalR sends over the wire.
 */
export interface Message {
  id: string;
  roomId: string;
  senderName: string;
  text: string;
  sentAt: string; // ISO 8601 string, server-stamped
}

export interface PresenceEvent {
  type: 'joined' | 'left';
  displayName: string;
}
