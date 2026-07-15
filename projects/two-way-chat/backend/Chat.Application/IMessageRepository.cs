using Chat.Domain;

namespace Chat.Application;

/// <summary>
/// Persistence seam for chat messages. Async throughout, mirroring the
/// TypeScript port discipline on the frontend. The MVP implementation is
/// in-memory (see Chat.Infrastructure); a future Postgres-backed
/// implementation can satisfy this same interface.
/// </summary>
public interface IMessageRepository
{
    Task<IReadOnlyList<Message>> GetByRoomAsync(string roomId);

    Task AddAsync(Message message);
}
