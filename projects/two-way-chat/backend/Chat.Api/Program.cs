using Chat.Api.Hubs;
using Chat.Application;
using Chat.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "FrontendDev";

builder.Services.AddSignalR();

// In-memory store must outlive individual requests/connections, so it is
// registered as a singleton — this is the seam a future
// PostgresMessageRepository would replace.
builder.Services.AddSingleton<IMessageRepository, InMemoryMessageRepository>();
builder.Services.AddScoped<IChatService, ChatService>();

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // required for SignalR
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(CorsPolicy);

app.MapHub<ChatHub>("/hubs/chat");

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
