using Chat.Application;
using Microsoft.AspNetCore.SignalR;

namespace Chat.Api.Hubs;

/// <summary>
/// SignalR hub for 2-way chat. No auth for the MVP — clients supply a
/// display name on join. Room membership is modeled with SignalR groups.
/// </summary>
public sealed class ChatHub : Hub
{
    private const string DisplayNameKey = "DisplayName";
    private const string RoomIdKey = "RoomId";

    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task JoinRoom(string roomId, string displayName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

        Context.Items[DisplayNameKey] = displayName;
        Context.Items[RoomIdKey] = roomId;

        var history = await _chatService.GetHistoryAsync(roomId);
        await Clients.Caller.SendAsync("MessageHistory", history);

        await Clients.OthersInGroup(roomId).SendAsync("UserJoined", displayName);
    }

    public async Task SendMessage(string roomId, string text)
    {
        var displayName = Context.Items.TryGetValue(DisplayNameKey, out var name) && name is string s
            ? s
            : string.Empty;

        var result = await _chatService.SendMessageAsync(roomId, displayName, text);

        if (!result.Success || result.Message is null)
        {
            await Clients.Caller.SendAsync("Error", result.Errors);
            return;
        }

        await Clients.Group(roomId).SendAsync("ReceiveMessage", result.Message);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items.TryGetValue(DisplayNameKey, out var name) && name is string displayName
            && Context.Items.TryGetValue(RoomIdKey, out var room) && room is string roomId)
        {
            await Clients.OthersInGroup(roomId).SendAsync("UserLeft", displayName);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
