using Chat.Domain;
using Chat.Infrastructure;

namespace Chat.Tests;

public class InMemoryMessageRepositoryTests
{
    private static Message NewMessage(string roomId, string sender = "Alex", string text = "Hello") =>
        new(Guid.NewGuid(), roomId, sender, text, DateTimeOffset.UtcNow);

    [Fact]
    public async Task GetByRoomAsync_UnknownRoom_ReturnsEmpty()
    {
        var repo = new InMemoryMessageRepository();

        var messages = await repo.GetByRoomAsync("nonexistent");

        Assert.Empty(messages);
    }

    [Fact]
    public async Task AddAsync_ThenGetByRoomAsync_ReturnsMessage()
    {
        var repo = new InMemoryMessageRepository();
        var message = NewMessage("general");

        await repo.AddAsync(message);
        var messages = await repo.GetByRoomAsync("general");

        Assert.Single(messages);
        Assert.Equal(message, messages[0]);
    }

    [Fact]
    public async Task AddAsync_PreservesInsertionOrder()
    {
        var repo = new InMemoryMessageRepository();
        var first = NewMessage("general", text: "first");
        var second = NewMessage("general", text: "second");

        await repo.AddAsync(first);
        await repo.AddAsync(second);

        var messages = await repo.GetByRoomAsync("general");

        Assert.Equal(new[] { "first", "second" }, messages.Select(m => m.Text));
    }

    [Fact]
    public async Task Rooms_AreIsolatedFromEachOther()
    {
        var repo = new InMemoryMessageRepository();

        await repo.AddAsync(NewMessage("room-a", text: "a-message"));
        await repo.AddAsync(NewMessage("room-b", text: "b-message"));

        var roomA = await repo.GetByRoomAsync("room-a");
        var roomB = await repo.GetByRoomAsync("room-b");

        Assert.Single(roomA);
        Assert.Equal("a-message", roomA[0].Text);
        Assert.Single(roomB);
        Assert.Equal("b-message", roomB[0].Text);
    }

    [Fact]
    public async Task AddAsync_ConcurrentAdds_AllMessagesPersisted()
    {
        var repo = new InMemoryMessageRepository();
        const int concurrentWriters = 50;

        var tasks = Enumerable.Range(0, concurrentWriters)
            .Select(i => repo.AddAsync(NewMessage("general", text: $"message-{i}")));

        await Task.WhenAll(tasks);

        var messages = await repo.GetByRoomAsync("general");
        Assert.Equal(concurrentWriters, messages.Count);
        Assert.Equal(concurrentWriters, messages.Select(m => m.Text).Distinct().Count());
    }

    [Fact]
    public async Task AddAsync_ConcurrentAddsAcrossRooms_KeepsRoomsIsolated()
    {
        var repo = new InMemoryMessageRepository();
        const int roomCount = 10;
        const int messagesPerRoom = 20;

        var tasks = new List<Task>();
        for (var r = 0; r < roomCount; r++)
        {
            var roomId = $"room-{r}";
            for (var m = 0; m < messagesPerRoom; m++)
            {
                tasks.Add(repo.AddAsync(NewMessage(roomId, text: $"{roomId}-{m}")));
            }
        }

        await Task.WhenAll(tasks);

        for (var r = 0; r < roomCount; r++)
        {
            var messages = await repo.GetByRoomAsync($"room-{r}");
            Assert.Equal(messagesPerRoom, messages.Count);
        }
    }
}
