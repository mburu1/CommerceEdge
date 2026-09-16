using System.Text.Json;
using CommerceEdge.Application.Abstractions;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace CommerceEdge.Infrastructure.Messaging;

/// <summary>
/// Redis pub/sub implementation of <see cref="IEventPublisher"/>.
/// Each event is serialized to JSON and broadcast on the <c>commerce.events</c> channel.
/// </summary>
public sealed class RedisEventPublisher : IEventPublisher
{
    private static readonly RedisChannel Channel = RedisChannel.Literal("commerce.events");
    private readonly IDatabase _db;
    private readonly ILogger<RedisEventPublisher> _logger;

    public RedisEventPublisher(IConnectionMultiplexer multiplexer, ILogger<RedisEventPublisher> logger)
    {
        _db = multiplexer.GetDatabase();
        _logger = logger;
    }

    public async Task PublishAsync<T>(T @event, CancellationToken ct = default)
        where T : class
    {
        var json = JsonSerializer.Serialize(@event);
        await _db.PublishAsync(Channel, json);
        _logger.LogDebug("Published event {EventType} ({Length} chars) to '{Channel}'", typeof(T).Name, json.Length, Channel);
    }
}
