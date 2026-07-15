namespace Chat.Domain;

/// <summary>
/// A single chat message. Immutable record — the server is the sole authority
/// for <see cref="Id"/> and <see cref="SentAt"/>; clients never supply these.
/// </summary>
public record Message(Guid Id, string RoomId, string SenderName, string Text, DateTimeOffset SentAt);
