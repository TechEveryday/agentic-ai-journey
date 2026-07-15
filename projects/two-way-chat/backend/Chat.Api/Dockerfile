# Build context is backend/ so this stage can see the whole solution
# (Chat.Domain, Chat.Application, Chat.Infrastructure, Chat.Api).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore Chat.Api/Chat.Api.csproj
RUN dotnet publish Chat.Api/Chat.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "Chat.Api.dll"]
