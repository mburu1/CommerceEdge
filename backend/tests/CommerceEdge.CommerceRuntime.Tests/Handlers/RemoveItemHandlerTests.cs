using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using FluentAssertions;
using NSubstitute;

namespace CommerceEdge.CommerceRuntime.Tests.Handlers;

public class RemoveItemHandlerTests
{
    private readonly ICartService _cartService = Substitute.For<ICartService>();
    private readonly RemoveItemHandler _handler;

    public RemoveItemHandlerTests()
    {
        _handler = new RemoveItemHandler(_cartService);
    }

    [Fact]
    public async Task HandleAsync_CartNotFound_ShouldReturnFailure()
    {
        var request = new RemoveItemRequest
        {
            StoreId = Guid.NewGuid(),
            RegisterId = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            CartId = Guid.NewGuid(),
            LineId = Guid.NewGuid()
        };

        _cartService.GetByIdAsync(Arg.Any<GetCartByIdQuery>(), Arg.Any<CancellationToken>())
            .Returns((CartDto?)null);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Cart not found");
    }

    [Fact]
    public async Task HandleAsync_ValidRequest_ShouldRemoveLineAndReturnUpdatedCart()
    {
        var request = new RemoveItemRequest
        {
            StoreId = Guid.NewGuid(),
            RegisterId = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            CartId = Guid.NewGuid(),
            LineId = Guid.NewGuid()
        };

        var cart = new CartDto(Guid.NewGuid(), request.StoreId, null, "USD", "Active", 0, []);
        _cartService.GetByIdAsync(Arg.Any<GetCartByIdQuery>(), Arg.Any<CancellationToken>())
            .Returns(cart);
        _cartService.GetByIdAsync(Arg.Any<GetCartByIdQuery>(), Arg.Any<CancellationToken>())
            .Returns(cart);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
        result.Cart.Should().BeEquivalentTo(cart);
        await _cartService.Received(1).RemoveLineAsync(
            Arg.Is<RemoveCartLineCommand>(c => c.CartId == request.CartId && c.LineId == request.LineId),
            Arg.Any<CancellationToken>());
    }
}
