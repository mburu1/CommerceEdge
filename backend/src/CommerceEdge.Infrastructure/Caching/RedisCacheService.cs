using System.Text.Json;
using CommerceEdge.Application.Abstractions;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace CommerceEdge.Infrastructure.Caching;

/// <summary>
/// Redis-backed implementation of <see cref="ICacheService"/>.
/// Serializes values as JSON so any POCO/DTO can be cached transparently.
/// </summary>
public sealed class RedisCacheService : ICacheService
{
    private readonly IDatabase _db;
    private readonly ILogger<RedisCacheService> _logger;

    public RedisCacheService(IConnectionMultiplexer multiplexer, ILogger<RedisCacheService> logger)
    {
        _db = multiplexer.GetDatabase();
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var json = (string?)await _db.StringGetAsync(key);
        if (string.IsNullOrEmpty(json))
        {
            return default;
        }

        try
        {
            return JsonSerializer.Deserialize<T>(json);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning("Failed to deserialize cache entry '{Key}': {Error}", key, ex.Message);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(value);
        var expiration = ttl.HasValue ? (Expiration)ttl.Value : default;
        await _db.StringSetAsync((RedisKey)key, (RedisValue)json, expiration);
        _logger.LogDebug("Cached '{Key}' ({Length} chars)", key, json.Length);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        await _db.KeyDeleteAsync(key);
        _logger.LogDebug("Removed cache entry '{Key}'", key);
    }
}
