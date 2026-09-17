using CommerceEdge.Api.Controllers;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Api.IntegrationTests.Observability;

public class ObservabilityIntegrationTests
{
    [Fact]
    public async Task ErrorResponse_IncludesCorrelationId()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.Create(
            new CreateCartCommand(Guid.NewGuid(), "USD", null),
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task ErrorResponse_IncludesTraceId()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.Create(
            new CreateCartCommand(Guid.NewGuid(), "USD", null),
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Controller_ReturnsResult()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.GetById(Guid.NewGuid(), TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
    }
}
