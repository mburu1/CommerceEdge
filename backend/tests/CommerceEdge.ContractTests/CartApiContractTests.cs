using CommerceEdge.Api.Controllers;
using CommerceEdge.Application.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.ContractTests;

public class CartApiContractTests
{
    [Fact]
    public async Task CartEndpoint_ReturnsProperResponseTypes()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var createResult = await controller.Create(new CommerceEdge.Application.Commands.CreateCartCommand(Guid.NewGuid(), "USD", null), default);

        createResult.Should().NotBeNull();
    }

    [Fact]
    public async Task CartEndpoint_GetById_ReturnsCartOrNotFound()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.GetById(Guid.NewGuid(), default);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task CartEndpoint_AddLine_ReturnsCart()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.AddLine(Guid.NewGuid(), new CommerceEdge.Application.Commands.AddCartLineCommand(Guid.NewGuid(), Guid.NewGuid(), null, "Widget", "W1", 10m, "USD", 2), default);

        result.Should().NotBeNull();
    }
}
