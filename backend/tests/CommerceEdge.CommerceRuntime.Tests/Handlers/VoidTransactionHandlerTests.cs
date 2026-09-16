using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using FluentAssertions;
using NSubstitute;

namespace CommerceEdge.CommerceRuntime.Tests.Handlers;

public class VoidTransactionHandlerTests
{
    private readonly ICartService _cartService = Substitute.For<ICartService>();
    private readonly VoidTransactionHandler _handler;

    public VoidTransactionHandlerTests()
    {
        _handler = new VoidTransactionHandler(_cartService);
    }

    [Fact]
    public async Task HandleAsync_ValidRequest_ShouldAbandonCartAndReturnSuccess()
    {
        var request = new VoidTransactionRequest
        {
            StoreId = Guid.NewGuid(),
            RegisterId = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            CartId = Guid.NewGuid()
        };

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
        result.RequestId.Should().Be(request.RequestId);
        await _cartService.Received(1).AbandonAsync(
            Arg.Is<AbandonCartCommand>(c => c.CartId == request.CartId), Arg.Any<CancellationToken>());
    }
}
