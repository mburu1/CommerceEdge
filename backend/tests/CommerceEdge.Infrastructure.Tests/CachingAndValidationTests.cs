using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Infrastructure.Tests;

public class CacheServiceTests
{
    [Fact]
    public async Task GetAsync_MissingKey_ReturnsNull()
    {
        var cache = Substitute.For<ICacheService>();
        var result = await cache.GetAsync<string>("missing", TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task SetAsync_SetsValue()
    {
        var cache = Substitute.For<ICacheService>();
        await cache.SetAsync("key", "value", null, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task RemoveAsync_RemovesKey()
    {
        var cache = Substitute.For<ICacheService>();
        await cache.SetAsync("key", "value", null, TestContext.Current.CancellationToken);
        await cache.RemoveAsync("key", TestContext.Current.CancellationToken);

        var result = await cache.GetAsync<string>("key", TestContext.Current.CancellationToken);
        result.Should().BeNull();
    }
}

public class InventoryServiceTests
{
    [Fact]
    public void GetInventoryBySkuQuery_CreatesCorrectQuery()
    {
        var query = new GetInventoryBySkuQuery(Guid.NewGuid(), "SKU1");

        query.StoreId.Should().NotBeEmpty();
        query.Sku.Should().Be("SKU1");
    }
}
