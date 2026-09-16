using System.Diagnostics.Metrics;
using System.Text.Json;
using CommerceEdge.Application.Abstractions;
using CommerceEdge.Observability;
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
        using var operation = CommerceEdgeTelemetry.Measure("cache.get");
        var json = (string?)await _db.StringGetAsync(key);
        if (string.IsNullOrEmpty(json))
        {
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "get" },
                { "result", "miss" }
            });
            return default;
        }

        try
        {
            var value = JsonSerializer.Deserialize<T>(json);
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "get" },
                { "result", "hit" }
            });
            return value;
        }
        catch (JsonException ex)
        {
            operation.MarkFailed();
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "get" },
                { "result", "error" }
            });
            _logger.LogWarning("Failed to deserialize cache entry: {Error}", ex.Message);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default)
    {
        using var operation = CommerceEdgeTelemetry.Measure("cache.set");
        try
        {
            var json = JsonSerializer.Serialize(value);
            var expiration = ttl.HasValue ? (Expiration)ttl.Value : default;
            await _db.StringSetAsync((RedisKey)key, (RedisValue)json, expiration);
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "set" },
                { "result", "success" }
            });
            _logger.LogDebug("Cached value ({Length} chars)", json.Length);
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "set" },
                { "result", "error" }
            });
            _logger.LogWarning("Failed to cache value: {Error}", ex.Message);
            throw;
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        using var operation = CommerceEdgeTelemetry.Measure("cache.remove");
        try
        {
            await _db.KeyDeleteAsync(key);
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "remove" },
                { "result", "success" }
            });
            _logger.LogDebug("Removed cache entry");
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            CommerceEdgeTelemetry.CacheOperationCount.Add(1, new System.Diagnostics.TagList
            {
                { "operation", "remove" },
                { "result", "error" }
            });
            _logger.LogWarning("Failed to remove cache entry: {Error}", ex.Message);
            throw;
        }
    }
}
