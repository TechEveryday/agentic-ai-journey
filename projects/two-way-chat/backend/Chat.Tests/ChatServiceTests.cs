using Chat.Application;
using Chat.Domain;

namespace Chat.Tests;

public class ChatServiceTests
{
    [Fact]
    public async Task SendMessageAsync_InvalidText_ReturnsFailureAndDoesNotPersist()
    {
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);

        var result = await service.SendMessageAsync("general", "Alex", "   ");

        Assert.False(result.Success);
        Assert.Null(result.Message);
        Assert.NotEmpty(result.Errors);
        Assert.Empty(await repo.GetByRoomAsync("general"));
    }

    [Fact]
    public async Task SendMessageAsync_InvalidSenderName_ReturnsFailure()
    {
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);

        var result = await service.SendMessageAsync("general", "", "Hello");

        Assert.False(result.Success);
        Assert.Contains("Sender name cannot be empty", result.Errors);
    }

    [Fact]
    public async Task SendMessageAsync_ValidInput_StampsIdAndSentAt()
    {
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);
        var before = DateTimeOffset.UtcNow;

        var result = await service.SendMessageAsync("general", "Alex", "Hello world");

        var after = DateTimeOffset.UtcNow;

        Assert.True(result.Success);
        Assert.NotNull(result.Message);
        Assert.NotEqual(Guid.Empty, result.Message!.Id);
        Assert.InRange(result.Message.SentAt, before, after);
    }

    [Fact]
    public async Task SendMessageAsync_IgnoresClientSuppliedIdAndTimestamp()
    {
        // The service signature doesn't even accept a client Id/SentAt —
        // this test documents that guarantee at the contract level: every
        // call produces a fresh server-stamped identity.
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);

        var first = await service.SendMessageAsync("general", "Alex", "Hello");
        var second = await service.SendMessageAsync("general", "Alex", "Hello");

        Assert.NotEqual(first.Message!.Id, second.Message!.Id);
    }

    [Fact]
    public async Task SendMessageAsync_ValidInput_PersistsViaRepository()
    {
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);

        await service.SendMessageAsync("general", "Alex", "Hello world");

        var messages = await repo.GetByRoomAsync("general");
        Assert.Single(messages);
        Assert.Equal("Hello world", messages[0].Text);
        Assert.Equal("Alex", messages[0].SenderName);
    }

    [Fact]
    public async Task SendMessageAsync_TrimsTextAndSenderName()
    {
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);

        var result = await service.SendMessageAsync("general", "  Alex  ", "  Hello  ");

        Assert.Equal("Alex", result.Message!.SenderName);
        Assert.Equal("Hello", result.Message.Text);
    }

    [Fact]
    public async Task GetHistoryAsync_DelegatesToRepository()
    {
        var repo = new InMemoryTestRepository();
        var service = new ChatService(repo);
        await service.SendMessageAsync("general", "Alex", "Hi");
        await service.SendMessageAsync("general", "Sam", "Hey");

        var history = await service.GetHistoryAsync("general");

        Assert.Equal(2, history.Count);
    }

    /// <summary>Minimal in-memory stand-in used to isolate ChatService from Infrastructure.</summary>
    private sealed class InMemoryTestRepository : IMessageRepository
    {
        private readonly Dictionary<string, List<Message>> _store = new();

        public Task<IReadOnlyList<Message>> GetByRoomAsync(string roomId)
        {
            IReadOnlyList<Message> messages = _store.TryGetValue(roomId, out var list)
                ? list.ToList()
                : Array.Empty<Message>();
            return Task.FromResult(messages);
        }

        public Task AddAsync(Message message)
        {
            if (!_store.TryGetValue(message.RoomId, out var list))
            {
                list = new List<Message>();
                _store[message.RoomId] = list;
            }

            list.Add(message);
            return Task.CompletedTask;
        }
    }
}
