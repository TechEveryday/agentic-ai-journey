using Chat.Domain;

namespace Chat.Application;

public sealed class ChatService : IChatService
{
    private readonly IMessageRepository _repository;

    public ChatService(IMessageRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<Message>> GetHistoryAsync(string roomId) =>
        _repository.GetByRoomAsync(roomId);

    public async Task<SendMessageResult> SendMessageAsync(string roomId, string senderName, string text)
    {
        var validation = MessageValidator.Validate(roomId, senderName, text);
        if (!validation.Valid)
        {
            return SendMessageResult.Failed(validation.Errors);
        }

        // Server is the sole authority for Id and SentAt — never trust the client.
        var message = new Message(
            Id: Guid.NewGuid(),
            RoomId: roomId,
            SenderName: senderName.Trim(),
            Text: text.Trim(),
            SentAt: DateTimeOffset.UtcNow);

        await _repository.AddAsync(message);

        return SendMessageResult.Ok(message);
    }
}
