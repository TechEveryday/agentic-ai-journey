using Chat.Domain;

namespace Chat.Application;

/// <summary>
/// Result of attempting to send a message: either a persisted <see cref="Message"/>
/// or a set of validation errors. Mirrors the frontend's result-shaped error handling.
/// </summary>
public sealed record SendMessageResult(bool Success, Message? Message, IReadOnlyList<string> Errors)
{
    public static SendMessageResult Ok(Message message) => new(true, message, Array.Empty<string>());

    public static SendMessageResult Failed(IReadOnlyList<string> errors) => new(false, null, errors);
}

public interface IChatService
{
    Task<IReadOnlyList<Message>> GetHistoryAsync(string roomId);

    /// <summary>
    /// Validates and persists a new message. The server stamps <c>Id</c> and
    /// <c>SentAt</c> — callers must never be trusted to supply these.
    /// </summary>
    Task<SendMessageResult> SendMessageAsync(string roomId, string senderName, string text);
}
