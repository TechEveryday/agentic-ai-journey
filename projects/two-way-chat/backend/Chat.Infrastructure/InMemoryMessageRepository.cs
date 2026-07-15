using System.Collections.Concurrent;
using Chat.Application;
using Chat.Domain;

namespace Chat.Infrastructure;

/// <summary>
/// In-memory message store, keyed by room id. SignalR handles many
/// concurrent connections, so both the outer map and each room's message
/// list must be safe under concurrent reads/writes.
/// </summary>
public sealed class InMemoryMessageRepository : IMessageRepository
{
    private readonly ConcurrentDictionary<string, List<Message>> _rooms = new();
    private readonly object _writeLock = new();

    public Task<IReadOnlyList<Message>> GetByRoomAsync(string roomId)
    {
        if (!_rooms.TryGetValue(roomId, out var messages))
        {
            return Task.FromResult<IReadOnlyList<Message>>(Array.Empty<Message>());
        }

        lock (_writeLock)
        {
            // Snapshot copy so callers can't mutate internal state and so
            // reads are never torn by a concurrent write.
            IReadOnlyList<Message> snapshot = messages.ToList();
            return Task.FromResult(snapshot);
        }
    }

    public Task AddAsync(Message message)
    {
        var room = _rooms.GetOrAdd(message.RoomId, _ => new List<Message>());

        lock (_writeLock)
        {
            room.Add(message);
        }

        return Task.CompletedTask;
    }
}
