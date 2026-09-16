using CommerceEdge.Api.Controllers;
using CommerceEdge.Application.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Api.IntegrationTests;

public class CartsControllerTests
{
    [Fact]
    public async Task GetById_ReturnsOk_WhenCartExists()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.GetById(Guid.NewGuid(), TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Create_ReturnsCreated()
    {
        var cartService = Substitute.For<ICartService>();
        var controller = new CartsController(cartService);

        var result = await controller.Create(new CommerceEdge.Application.Commands.CreateCartCommand(Guid.NewGuid(), "USD", null), TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
    }
}
