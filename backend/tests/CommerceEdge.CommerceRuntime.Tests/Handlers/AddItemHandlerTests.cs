using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.Domain.Enums;
using FluentAssertions;
using NSubstitute;

namespace CommerceEdge.CommerceRuntime.Tests.Handlers;

public class AddItemHandlerTests
{
    private readonly IProductService _productService = Substitute.For<IProductService>();
    private readonly IInventoryService _inventoryService = Substitute.For<IInventoryService>();
    private readonly ICartService _cartService = Substitute.For<ICartService>();
    private readonly AddItemHandler _handler;

    public AddItemHandlerTests()
    {
        _handler = new AddItemHandler(_productService, _inventoryService, _cartService);
    }

    [Fact]
    public async Task HandleAsync_ProductNotFound_ShouldReturnFailure()
    {
        var request = CreateRequest();
        _productService.GetBySkuAsync(Arg.Any<GetProductBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns((ProductDto?)null);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("not found");
    }

    [Fact]
    public async Task HandleAsync_ProductNotActive_ShouldReturnFailure()
    {
        var request = CreateRequest();
        _productService.GetBySkuAsync(Arg.Any<GetProductBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(new ProductDto(
                Guid.NewGuid(), "Test", "SKU1", "Desc", 9.99m, "USD",
                ProductStatus.Discontinued.ToString(), [], []));

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("not available");
    }

    [Fact]
    public async Task HandleAsync_InsufficientStock_ShouldReturnFailure()
    {
        var request = CreateRequest();
        _productService.GetBySkuAsync(Arg.Any<GetProductBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(CreateProduct());
        _inventoryService.GetBySkuAsync(Arg.Any<GetInventoryBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(new InventoryDto(
                Guid.NewGuid(), Guid.NewGuid(), null, Guid.NewGuid(), "SKU1",
                2, 0, 2, 0, "Available"));

        request = request with { Quantity = 5 };
        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Insufficient stock");
    }

    [Fact]
    public async Task HandleAsync_StockIsNull_ShouldReturnFailure()
    {
        var request = CreateRequest();
        _productService.GetBySkuAsync(Arg.Any<GetProductBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(CreateProduct());
        _inventoryService.GetBySkuAsync(Arg.Any<GetInventoryBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns((InventoryDto?)null);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Insufficient stock");
    }

    [Fact]
    public async Task HandleAsync_AllValid_ShouldAddItemAndReturnCart()
    {
        var request = CreateRequest();
        var product = CreateProduct();
        var stock = new InventoryDto(
            Guid.NewGuid(), Guid.NewGuid(), null, request.StoreId, "SKU1",
            10, 0, 10, 0, "Available");
        var cart = new CartDto(Guid.NewGuid(), request.StoreId, null, "USD", "Active", 0, []);

        _productService.GetBySkuAsync(Arg.Any<GetProductBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(product);
        _inventoryService.GetBySkuAsync(Arg.Any<GetInventoryBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(stock);
        _cartService.AddLineAsync(Arg.Any<AddCartLineCommand>(), Arg.Any<CancellationToken>())
            .Returns(cart);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
        result.Cart.Should().BeEquivalentTo(cart);
        await _productService.Received(1).GetBySkuAsync(
            Arg.Is<GetProductBySkuQuery>(q => q.Sku == request.Sku), Arg.Any<CancellationToken>());
        await _inventoryService.Received(1).GetBySkuAsync(
            Arg.Is<GetInventoryBySkuQuery>(q => q.StoreId == request.StoreId && q.Sku == request.Sku),
            Arg.Any<CancellationToken>());
        await _cartService.Received(1).AddLineAsync(Arg.Any<AddCartLineCommand>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleAsync_ExactStockQuantity_ShouldSucceed()
    {
        var request = CreateRequest();
        var stock = new InventoryDto(
            Guid.NewGuid(), Guid.NewGuid(), null, request.StoreId, "SKU1",
            3, 0, 3, 0, "Available");

        _productService.GetBySkuAsync(Arg.Any<GetProductBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(CreateProduct());
        _inventoryService.GetBySkuAsync(Arg.Any<GetInventoryBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(stock);
        _cartService.AddLineAsync(Arg.Any<AddCartLineCommand>(), Arg.Any<CancellationToken>())
            .Returns(new CartDto(Guid.NewGuid(), request.StoreId, null, "USD", "Active", 0, []));

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
    }

    private static AddItemRequest CreateRequest() => new()
    {
        StoreId = Guid.NewGuid(),
        RegisterId = Guid.NewGuid(),
        EmployeeId = Guid.NewGuid(),
        CartId = Guid.NewGuid(),
        Sku = "SKU1",
        Quantity = 2
    };

    private static ProductDto CreateProduct() => new(
        Guid.NewGuid(), "Test Product", "SKU1", "Desc", 9.99m, "USD",
        ProductStatus.Active.ToString(), [], []);
}
