using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;

namespace CommerceEdge.CommerceRuntime.Tests.Handlers;

public class StartTransactionHandlerTests
{
    private readonly ICartService _cartService = Substitute.For<ICartService>();
    private readonly StartTransactionHandler _handler;

    public StartTransactionHandlerTests()
    {
        _handler = new StartTransactionHandler(_cartService);
    }

    [Fact]
    public async Task HandleAsync_WhenCalled_ShouldCreateCartAndReturnResponse()
    {
        var request = new StartTransactionRequest
        {
            StoreId = Guid.NewGuid(),
            RegisterId = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            Currency = "USD",
            CustomerId = null
        };

        var expectedCart = new CartDto(
            Guid.NewGuid(), request.StoreId, null, "USD", "Active", 0, []);
        _cartService.CreateAsync(Arg.Any<CreateCartCommand>(), Arg.Any<CancellationToken>())
            .Returns(expectedCart);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.RequestId.Should().Be(request.RequestId);
        result.Cart.Should().BeEquivalentTo(expectedCart);
        await _cartService.Received(1).CreateAsync(
            Arg.Is<CreateCartCommand>(c =>
                c.StoreId == request.StoreId &&
                c.Currency == request.Currency &&
                c.CustomerId == request.CustomerId), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_WithCustomerId_ShouldPassCustomerToCartService()
    {
        var customerId = Guid.NewGuid();
        var request = new StartTransactionRequest
        {
            StoreId = Guid.NewGuid(),
            RegisterId = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            Currency = "USD",
            CustomerId = customerId
        };

        var expectedCart = new CartDto(
            Guid.NewGuid(), request.StoreId, customerId, "USD", "Active", 0, []);
        _cartService.CreateAsync(Arg.Any<CreateCartCommand>(), Arg.Any<CancellationToken>())
            .Returns(expectedCart);

await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        await _cartService.Received(1).CreateAsync(
            Arg.Is<CreateCartCommand>(c => c.CustomerId == customerId), Arg.Any<CancellationToken>());
    }
}
